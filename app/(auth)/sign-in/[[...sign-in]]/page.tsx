import { SignIn } from '@clerk/nextjs'
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function Page() {
    const { userId } = await auth();

    //already logged in, skip the landing page
    if (userId) {
        redirect("/home");
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">

            {/* background design */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />

            <div className="z-10 flex flex-col items-center gap-8">
                <div className="text-center space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-lg inline-flex items-center justify-center mb-2">
                        <Image
                            src="/favicon.ico"
                            alt="UniSpace Logo"
                            width={64}
                            height={64}
                            className="w-16 h-16 object-contain"
                        />
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                            UniSpace
                        </h1>
                        <p className="text-slate-500 font-medium">
                            Smart Campus Management System
                        </p>
                    </div>
                </div>

                {/* sign in */}
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-xl border border-white/50">
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "shadow-none bg-transparent",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50",
                                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                                footerActionLink: "text-blue-600 hover:text-blue-700"
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}