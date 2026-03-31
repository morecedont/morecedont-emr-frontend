export default function PatientPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Paciente {params.id}</h1>
    </div>
  )
}
