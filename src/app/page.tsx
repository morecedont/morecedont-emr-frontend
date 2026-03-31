import { createClient } from "@/lib/supabase/server"
import Navbar from "./(home)/components/Navbar"
import HeroSection from "./(home)/components/HeroSection"
import ProblemSection from "./(home)/components/ProblemSection"
import WhatIsSection from "./(home)/components/WhatIsSection"
import BenefitsSection from "./(home)/components/BenefitsSection"
import HowItWorksSection from "./(home)/components/HowItWorksSection"
import ForWhomSection from "./(home)/components/ForWhomSection"
import FAQSection from "./(home)/components/FAQSection"
import CTASection from "./(home)/components/CTASection"
import Footer from "./(home)/components/Footer"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userStatus: "active" | "pending" | "rejected" | null = null

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single()

    userStatus = (profile?.status as typeof userStatus) ?? "active"
  }

  return (
    <>
      <Navbar isAuthenticated={!!user} userStatus={userStatus} />
      <main>
        <HeroSection />
        <ProblemSection />
        <WhatIsSection />
        <BenefitsSection />
        <HowItWorksSection />
        <ForWhomSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
