import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e descrição */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-bold text-white">fresh<span className="text-primary-400">market</span>.</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Seu supermercado online com os melhores produtos e preços. Entrega rápida e segura.
            </p>
          </div>

          {/* Links úteis */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">Início</Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">Sobre nós</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">Contato</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h3 className="text-white font-semibold mb-4">Atendimento</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-phone text-primary-400"></i>
                <span>(99) 99999-9999</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-envelope text-primary-400"></i>
                <span>contato@freshmarket.com</span>
              </li>
              <li className="flex items-center gap-2">
                <i className="fa-solid fa-clock text-primary-400"></i>
                <span>Seg - Sex: 8h às 20h</span>
              </li>
            </ul>
          </div>

          {/* Redes sociais */}
          <div>
            <h3 className="text-white font-semibold mb-4">Redes Sociais</h3>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary-500 transition-colors"
                aria-label="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary-500 transition-colors"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-primary-500 transition-colors"
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Linha divisória e copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} FreshMarket. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
