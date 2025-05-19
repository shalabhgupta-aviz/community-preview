import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Products</h3>
          <ul className="list-none space-y-2">
            <li className="text-gray-300 hover:text-white cursor-pointer">Certified Community SONiC</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Network Copilot™</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Open Networking Enterprise Suite</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Open Packet Broker</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Service Nodes</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Fabric Test Automation Suite</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Solutions</h3>
          <ul className="list-none space-y-2">
            <li className="text-gray-300 hover:text-white cursor-pointer">SONiC for Data Center, Edge & GPU Networks</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Netops</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Network Observability Solutions</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Copilot</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Platform Integrations</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul className="list-none space-y-2">
            <li className="text-gray-300 hover:text-white cursor-pointer">About us</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Meet the team</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Blog</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Events</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">ONES Validated Design (OVD)</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Aviz Certified SONiC Professional (ACSP)</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Support</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="list-none space-y-2">
            <li className="text-gray-300 hover:text-white cursor-pointer">Open Source Community</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">SONiC Foundation</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Newsroom</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Partners</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">Training and Certification</li>
            <li className="text-gray-300 hover:text-white cursor-pointer">TCO Calculator</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t border-gray-700 pt-4 text-center">
        <p>Subscribe to Aviz latest updates</p>
        <button className="bg-[#191153] text-white py-2 px-6 rounded-full hover:bg-[#2a1c7a] font-medium">Join</button>
        <div className="mt-4 space-x-4">
          <a href="#" className="inline-block text-gray-300 hover:text-white">Facebook</a>
          <a href="#" className="inline-block text-gray-300 hover:text-white">X</a>
          <a href="#" className="inline-block text-gray-300 hover:text-white">YouTube</a>
          <a href="#" className="inline-block text-gray-300 hover:text-white">LinkedIn</a>
        </div>
        <div className="mt-4 space-x-4">
          <a href="#" className="inline-block text-sm text-gray-400 hover:text-white">Privacy Policy</a>
          <a href="#" className="inline-block text-sm text-gray-400 hover:text-white">Terms of Use*</a>
        </div>
        <p>Copyright © 2025 Aviz Networks, Inc. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
