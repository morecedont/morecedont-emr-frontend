export default function PatientHistoryPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Historia Clínica — Paciente {params.id}</h1>
    </div>
  )
}
