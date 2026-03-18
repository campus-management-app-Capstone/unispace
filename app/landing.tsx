import React from 'react'
import Image from 'next/image'
import { Link } from 'lucide-react'
import { SignIn } from '@clerk/nextjs'
import { ArrowRight, PlayCircle, Star, Menu, X, Facebook, Twitter, Instagram } from 'lucide-react'

export default function Landing() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
              <img alt="UniSpace Logo" className="h-8 w-auto" data-alt="UniSpace minimalist university logo" src="favicon.ico"/>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">UniSpace</h2>
      </div>
    <nav className="hidden md:flex items-center gap-8">
<a className="text-sm font-medium hover:text-primary transition-colors" href="#">Home</a>
<a className="text-sm font-medium hover:text-primary transition-colors" href="#">Courses</a>
<a className="text-sm font-medium hover:text-primary transition-colors" href="#">Campus Life</a>
<a className="text-sm font-medium hover:text-primary transition-colors" href="#">Support</a>
</nav>
<div className="flex items-center gap-4">
<button className="hidden sm:block text-sm font-semibold px-4 py-2 text-slate-700 dark:text-slate-300">Log In</button>
<button className="bg-primary text-white text-sm font-bold py-2 px-6 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                        Sign Up
                    </button>
</div>
</div>
</div>
</header>
    <div className='flex-col'>
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Home</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Courses</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Campus Life</a>
              <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Support</a>
            </nav>
            <div className="flex items-center gap-4">
              {/* <button className="hidden sm:block text-sm font-semibold px-4 py-2 text-slate-700 dark:text-slate-300">Log In</button> */}
              <Link href="/sign-in" className='hidden sm:block text-sm font-semibold px-4 py-2 text-slate-700 dark:text-slate-300'>
                <SignIn />
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className=''>

        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium leading-5 bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                  Welcome to UniSpace
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                  Empowering Your <span className="text-primary">University Journey</span>
                </h1>
                <p className="text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto lg:mx-0">
                  Experience a seamless academic life with UniSpace. Manage your courses, stay updated with campus news, and access student support all in one place. Designed for modern scholars.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 text-base font-bold py-4 px-10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                    <span className="material-symbols-outlined">play_circle</span>
                    Explore Campus
                  </button>
                </div>
              </div>
              <div className="flex-1 w-full max-w-2xl">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <div className="aspect-video bg-slate-200 dark:bg-slate-800" data-alt="Modern university campus building at sunset" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBY3mn0tv_WYAGU8RNLrlta5Lcw4q9_Kw7Q2HF5Wm9FARvlYKJ1K7cXeoKzq94RZSyOIHsfy7Z-nWgJ-suj1V1sHbVx_Yth-hAZqG7VS0cIRgF-lC-kp8P9jI2iNbKthTZq4bAV4yQlP25BKKLHT8Lhz60IuKCtk_44QuNkUC_rnWRRRtXwod64zbSRxGUa9bNomDJo38xJHoMGJ091l-LHRg5Q_v45TzD1fgQBgaU-60YTav4zu2471Hv2B7IDkParpadsQxNmmRsE')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/40 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-slate-50 dark:bg-background-dark/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Core Features</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">Everything you need to succeed in your academic career, integrated into a single powerful platform.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">book_4</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Course Management</h3>
                <p className="text-slate-600 dark:text-slate-400">Easily track your modules, assignments, and grades in real-time with automated scheduling and alerts.</p>
              </div>
              <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">newspaper</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Campus News</h3>
                <p className="text-slate-600 dark:text-slate-400">Stay informed with the latest happenings, official announcements, and student-led initiatives around campus.</p>
              </div>
              <div className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">support_agent</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Student Support</h3>
                <p className="text-slate-600 dark:text-slate-400">Access dedicated resources, mental health advocacy, and academic counseling services whenever you need them.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">Campus Life</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">Experience more than just lectures. Explore our vibrant community.</p>
              </div>
              <a className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline" href="#">
                View All Events <span className="material-symbols-outlined"></span>
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                  <img alt="Tech Symposium" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Students at a technology symposium" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ52_SEk08xV3-7v5_ijBQRX_G6zolJ0crvwLhbWSBkUHbdOIAJn0fDCwOiiwp07IGxnLUMdErDAweydUgeE0aNCwLtx2tpx2M72JcYxz4Y1QG2b2PAmGVb9cqPXadAtFqpsI5fKn_tp_7jqSehfZqtVJMzIngqvYwvqzGDSTLpCB9OX4FXe7ZaCI_cNT_ySTCDrShppy3Wh40k43qYZnuSms_rxWoTSw21uBqP9gNkDU6iJEQ0HTxz8Vw-6J1WoviaEouguTSvj-r" />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Event</div>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Annual Tech Symposium</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Join global leaders in innovation and tech workshops.</p>
              </div>
              <div className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                  <img alt="Culture Fest" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Diverse group of students celebrating culture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDTkKPzNhZBIQhOMB3qatFw6nJtGc9NK10FQ7bBKv0O6WXqA3rfFonD1pwCzPD1iZhpuYH48KPfd6PyYTDoZb60WPQNBy322CnfTVZBSlmSOpmnAlOYPZKRi7ilT6SB5i8_qfM0P-E19xmTLN-yl3ymbuSe7gYB4_SiQYFnPmXepNfJ53-QI4amkeEO84JSLJnRexCF5yrXVHJ-pY-iIVHtBDWKl8DEdzBWYvxslpVW9gupQIFANQnmZTeC-1ar5OE7iadn7d-OtBV" />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Festival</div>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Global Culture Fest</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Celebrating our diverse student body with food and art.</p>
              </div>
              <div className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                  <img alt="Study Sessions" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-alt="Students studying together in a modern library" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAU0Wa_X30AwJbWPtzBKeiuxM0mL4ZllSpTFqQWhEO8F057kdUgc_Xfy6yuF1Ug2DZwGU3-K-xGPGWO-C-oGojcfap8Z3w8HV4dik55baRUaoIraWSY6AQ3AjqVvm8yST7IYn-sxsE9JAjM7SJ6ArWF8Qzf8a19BDyH4KqA4D_UJ1GbqN3298W8qeJwkxH52mXKSnzX496gN2ZECInHIlhnprQ9Lq4-xTYhJlP1ayfhpvcWuIfKYxDLDVzWic_GzGjheaM55QRPs5Y8" />
                  <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Community</div>
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Collaborative Study Nights</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">State-of-the-art facilities open 24/7 for student success.</p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-20 bg-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">What Our Students Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex gap-1 text-primary mb-4">
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic mb-6">"UniSpace completely transformed how I manage my studies. Having everything in one app is a game changer for my productivity."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" data-alt="Student profile photo" ></div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Alex Johnson</h5>
                    <p className="text-xs text-slate-500">Computer Science, Year 3</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex gap-1 text-primary mb-4">
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic mb-6">"The support section helped me find a mentor when I was struggling with my thesis. I feel more connected to the university than ever."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" data-alt="Student profile photo" ></div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Sarah Lim</h5>
                    <p className="text-xs text-slate-500">Business Management, Year 2</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex gap-1 text-primary mb-4">
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star</span>
                  <span className="material-symbols-outlined fill-1">star_half</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 italic mb-6">"I never miss a campus event now. The notifications for news and festivals are timely and actually useful for social life."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200" data-alt="Student profile photo" ></div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">Michael Chen</h5>
                    <p className="text-xs text-slate-500">Engineering, Year 4</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl p-8 md:p-16 text-center text-white space-y-8 relative overflow-hidden bg-[#1c4494]">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <h2 className="text-3xl md:text-5xl font-black relative z-10">Ready to start your journey?</h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto relative z-10">Join over 15,000 students who use UniSpace daily to streamline their academic life.</p>
              <div className="max-w-md mx-auto relative z-10">
                <form className="flex flex-col sm:flex-row gap-3">
                  <input className="flex-1 rounded-xl px-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-white" placeholder="Enter your student email" type="email" />
                  <button className="bg-slate-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-slate-800 transition-all">Get Started</button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

