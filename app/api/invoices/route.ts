import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { invoices, operationalEvents, resources } from "@/lib/schema";

const createInvoiceSchema = z.object({
  resourceId: z.string().min(1),
  vendor: z.string().min(1).max(100),
  amount: z.number().min(0),
  currency: z.string().min(1).max(8).default("USD"),
  billingPeriod: z.string().max(40).optional().nullable(),
  invoiceDate: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const resourceId = searchParams.get("resourceId");
    if (!workspaceId && !resourceId)
      return NextResponse.json(
        { error: "workspaceId or resourceId required" },
        { status: 400 }
      );

    const db = getDb();
    const conditions = [
      workspaceId ? eq(resources.workspaceId, workspaceId) : undefined,
      resourceId ? eq(invoices.resourceId, resourceId) : undefined,
    ].filter((c): c is NonNullable<typeof c> => c !== undefined);

    const rows = await db
      .select({
        invoice: invoices,
        resourceName: resources.name,
        resourceVendor: resources.vendorName,
      })
      .from(invoices)
      .innerJoin(resources, eq(resources.id, invoices.resourceId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(invoices.invoiceDate));

    return NextResponse.json(
      rows.map((r) => ({
        ...r.invoice,
        resourceName: r.resourceName,
        resourceVendor: r.resourceVendor,
      }))
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = createInvoiceSchema.parse(await req.json());
    const db = getDb();

    const [resource] = await db
      .select()
      .from(resources)
      .where(eq(resources.id, body.resourceId))
      .limit(1);
    if (!resource)
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });

    const amount = Math.round(body.amount * 100) / 100;

    const [invoice] = await db
      .insert(invoices)
      .values({ ...body, amount })
      .returning();

    await db.insert(operationalEvents).values({
      workspaceId: resource.workspaceId,
      projectId: resource.projectId,
      resourceId: resource.id,
      eventType: "invoice_uploaded",
      description: `Invoice recorded for ${resource.name} · ${body.vendor} · ${amount.toFixed(
        2
      )} ${body.currency}`,
      metadata: { invoiceId: invoice.id, amount, billingPeriod: body.billingPeriod },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
}
