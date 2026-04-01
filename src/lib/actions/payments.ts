"use server"

import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function addPayment(
  medicalHistoryId: string,
  data: {
    date: string
    toothUnit: string
    clinicalActivity: string
    cost: number
    payment: number
  }
): Promise<{ error?: string }> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  const history = await prisma.medical_histories.findFirst({
    where: { id: medicalHistoryId, doctor_id: profile.id },
  })
  if (!history) return { error: "No autorizado" }

  try {
    await prisma.treatment_payments.create({
      data: {
        medical_history_id: medicalHistoryId,
        payment_date: new Date(data.date),
        tooth_unit: data.toothUnit || null,
        clinical_activity: data.clinicalActivity,
        cost: new Prisma.Decimal(data.cost || 0),
        payment: new Prisma.Decimal(data.payment || 0),
      },
    })
    return {}
  } catch (err) {
    console.error("addPayment error:", err)
    return { error: "Error al registrar el pago" }
  }
}
