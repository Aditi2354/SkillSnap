import { NextResponse } from "next/server";
import { curatedResources } from "@/lib/resources";
export async function GET() { return NextResponse.json(curatedResources); }