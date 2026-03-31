export default function Footer() {
  return (
    <footer className="bg-brand-footer pt-20 pb-12 px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-2xl font-headline font-bold text-white mb-6">
              Morecedont
            </div>
            <p className="text-slate-300 leading-relaxed">
              Innovación en gestión dental para los profesionales del mañana.
            </p>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="text-white font-bold mb-6">Plataforma</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Seguridad
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Precios
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Política de privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Términos de servicio
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors">
                  Soporte
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-bold mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="material-symbols-outlined text-sm">mail</span>
                soporte@morecedont.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm">
            © 2025 Morecedont. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#inicio" className="text-slate-400 hover:text-white transition-colors text-sm">
              Inicio
            </a>
            <a href="#como-funciona" className="text-slate-400 hover:text-white transition-colors text-sm">
              Cómo funciona
            </a>
            <a href="#faq" className="text-slate-400 hover:text-white transition-colors text-sm">
              FAQ
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
