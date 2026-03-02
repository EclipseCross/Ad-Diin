export function Footer() {
    return (
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-600 text-white px-3 py-2 rounded-md">
                  <span className="text-xl font-bold">الدين</span>
                </div>
                <span className="text-xl font-bold">Ad-Diin</span>
              </div>
              <p className="text-gray-400 text-sm text-center md:text-left">
                A Place of Prayer, Learning, and Community Service
              </p>
            </div>
  
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-emerald-600 p-3 rounded-full transition-colors" aria-label="Facebook">FB</a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="bg-gray-800 hover:bg-emerald-600 p-3 rounded-full transition-colors" aria-label="YouTube">YT</a>
              </div>
            </div>
  
            <div className="flex flex-col items-center md:items-end">
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <div className="flex flex-col gap-2 text-center md:text-right">
                <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">Terms & Conditions</a>
              </div>
            </div>
          </div>
  
          <div className="border-t border-gray-800 pt-6">
            <p className="text-center text-gray-400 text-sm">
              Copyright © {new Date().getFullYear()} AD-Diin
            </p>
          </div>
        </div>
      </footer>
    );
  }
  