import { UserButton } from "@clerk/nextjs";

export default async function Navbar() {


    return (
        <nav className="border-b p-4 z-100 flex items-center justify-between bg-white shadow-sm">
            <div className="flex items-center gap-4">
                <UserButton />
            </div>
        </nav>
    );
}
