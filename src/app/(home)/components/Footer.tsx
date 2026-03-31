export default function Footer() {
  return (
    <footer className="bg-brand-footer pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 text-left">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="text-xl sm:text-2xl font-headline font-bold text-white mb-4 sm:mb-6">
              Morecedont
            </div>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Innovación en gestión dental para los profesionales del mañana.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">
              Plataforma
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Características
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Seguridad
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Precios
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">
              Legal
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Política de privacidad
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Términos de servicio
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-slate-300 hover:text-white transition-colors text-sm sm:text-base"
                >
                  Soporte
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-bold mb-4 sm:mb-6 text-sm sm:text-base">
              Contacto
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-center gap-2 text-slate-300 text-sm sm:text-base">
                <span className="material-symbols-outlined text-sm shrink-0">
                  mail
                </span>
                soporte@morecedont.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 sm:mt-14 lg:mt-20 pt-6 sm:pt-8 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="text-slate-400 text-xs sm:text-sm">
            © 2025 Morecedont. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <a
              href="#inicio"
              className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm"
            >
              Inicio
            </a>
            <a
              href="#como-funciona"
              className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm"
            >
              Cómo funciona
            </a>
            <a
              href="#faq"
              className="text-slate-400 hover:text-white transition-colors text-xs sm:text-sm"
            >
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
