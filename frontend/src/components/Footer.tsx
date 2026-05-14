import { Link } from 'react-router-dom';
import { ShieldCheck, CodeXml, Mail, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-darknavy text-darknavy-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-white">ExamGuard</span>
            </Link>
            <p className="mt-4 text-sm text-darknavy-400 max-w-md leading-relaxed">
              A secure, full-stack quiz and examination platform built for academic
              institutions. Manage classes, deliver assessments, and analyze performance —
              all in one place.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Source code"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
              >
                <CodeXml size={16} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                aria-label="Website"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
              >
                <Globe size={16} />
              </a>
              <a
                href="mailto:contact@examguard.com"
                aria-label="Email"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="mailto:contact@examguard.com" className="hover:text-white transition-colors">
                  contact@examguard.com
                </a>
              </li>
              <li className="text-darknavy-400">FAST-NUCES, Islamabad</li>
              <li className="text-darknavy-400">Web Programming · 2026</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-darknavy-400">
          <p>&copy; 2026 ExamGuard. All rights reserved.</p>
          <p>Built by Muhammad Umair (23I-0662) & Mahad Malik (23I-0537)</p>
        </div>
      </div>
    </footer>
  );
};
