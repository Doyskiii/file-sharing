import { FormLogin } from "@/components/form/auth/form-login";
import Image from "next/image";
import republikorp_logo from '../../public/republikorp-logo.png'
import { TypographyH2 } from "@/components/ui/typography";

export default function Home() {
  return (
    <div className="w-dvw h-dvh flex justify-center items-center relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 opacity-90"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.05),transparent_50%)]"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col gap-6 items-center animate-in fade-in-0 duration-1000">
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-8 shadow-2xl shadow-zinc-900/50 min-w-[480px] max-w-lg">
          <div className="flex flex-col gap-6 items-center">
            <div className="relative">
              <Image
                src={republikorp_logo}
                alt="republikorp-logo"
                className="h-[80px] w-[80px] drop-shadow-lg hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl -z-10"></div>
            </div>
            <div className="text-center">
              <TypographyH2 className="text-white drop-shadow-sm text-2xl">File-Sharing</TypographyH2>
              <p className="text-zinc-400 text-sm mt-1">Secure file sharing with end-to-end encryption</p>
            </div>
            <FormLogin/>
          </div>
        </div>
      </div>
    </div>
  );
}
