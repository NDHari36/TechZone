const services = [
  {
    title: 'Free Shipping',
    description: 'Miễn phí vận chuyển cho đơn hàng trên 500k',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
  {
    title: '24/7 Support',
    description: 'Hỗ trợ khách hàng 24/7',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    title: 'Secure Payment',
    description: 'Phương thức thanh toán an toàn 100%',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Money Back',
    description: 'Đảm bảo hoàn tiền trong 30 ngày',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function ServicesSection() {
  return (
    <section id="service" className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-wider text-slate-900 font-Bebas">Dịch vụ của chúng tôi</h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div key={service.title} className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900">{service.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;

// function ServicesSection() {
//     const services = [
//         {
//             title: "Free Shipping",
//             description: "Miễn phí vận chuyển cho đơn hàng trên 500k",
//             icon: (
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
//                 </svg>
//             ),
//         },
//         {
//             title: "24/7 Support",
//             description: "Hỗ trợ khách hàng 24/7",
//             icon: (
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//             ),
//         },
//         {
//             title: "Secure Payment",
//             description: "Phương thức thanh toán an toàn 100%",
//             icon: (
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//             ),
//         },
//         {
//             title: "Money Back",
//             description: "Đảm bảo hoàn tiền trong 30 ngày",
//             icon: (
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//             ),
//         },
//     ]

//     return (
//         <section id="service" className="py-16 bg-gray-50">
//             <div className="max-w-7xl mx-auto px-4">
//                 <h2 className="text-3xl font-bold text-center mb-12 font-Bebas tracking-wider">Services</h2>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//                     {services.map((service, index) => (
//                         <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
//                             <div className="flex flex-col items-center text-center">
//                                 <div className="mb-4">{service.icon}</div>
//                                 <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
//                                 <p className="text-gray-600">{service.description}</p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     )
// }
// export default ServicesSection