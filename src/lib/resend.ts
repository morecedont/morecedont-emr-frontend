import { Resend } from "resend"
import fs from "fs"
import path from "path"

const resend = new Resend(process.env.RESEND_API_KEY)

function renderWelcomeHtml(vars: {
  doctorName: string
  specialty: string
  loginUrl: string
}): string {
  const template = fs.readFileSync(
    path.join(process.cwd(), "emails", "welcome_email.html"),
    "utf-8"
  )
  return template
    .replace(/\{\{doctor_name\}\}/g, vars.doctorName)
    .replace(/\{\{specialty\}\}/g, vars.specialty)
    .replace(/\{\{login_url\}\}/g, vars.loginUrl)
    .replace(/\{\{unsubscribe_url\}\}/g, vars.loginUrl)
}

export async function sendWelcomeEmail(opts: {
  to: string
  doctorName: string
  specialty: string
  loginUrl: string
}): Promise<void> {
  const html = renderWelcomeHtml(opts)

  const { error } = await resend.emails.send({
    from: "Morecedont <noreply@morecedont.online>",
    to: [opts.to],
    subject: "Bienvenido a Morecedont — tu cuenta está activa",
    html,
  })

  if (error) throw new Error(error.message)
}
