import { useNavigate } from "react-router-dom";
import logo from "@/assets/storify-logo.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden px-6">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      <img
        src={logo}
        alt="STORIFY"
        className="relative w-48 md:w-64 logo-glow mb-16"
      />

      <h1 className="relative text-3xl md:text-5xl font-light tracking-[0.4em] text-foreground text-glow-soft mb-12">
        SELECT MODE
      </h1>

      <div className="relative flex flex-col sm:flex-row gap-6 w-full max-w-4xl">
        <button
          onClick={() => navigate("/register?desk=1")}
          className="flex-1 py-6 px-8 border-2 border-primary text-foreground tracking-[0.3em] text-sm md:text-base font-medium rounded-md transition-all duration-300 hover:bg-primary hover:shadow-[0_0_40px_hsl(var(--glow-red)/0.6)]"
        >
          REGISTRATION DESK 1
        </button>
        <button
          onClick={() => navigate("/register?desk=2")}
          className="flex-1 py-6 px-8 border-2 border-primary text-foreground tracking-[0.3em] text-sm md:text-base font-medium rounded-md transition-all duration-300 hover:bg-primary hover:shadow-[0_0_40px_hsl(var(--glow-red)/0.6)]"
        >
          REGISTRATION DESK 2
        </button>
        <button
          onClick={() => navigate("/display")}
          className="flex-1 py-6 px-8 bg-primary text-primary-foreground tracking-[0.3em] text-sm md:text-base font-medium rounded-md transition-all duration-300 hover:shadow-[0_0_50px_hsl(var(--glow-red)/0.8)]"
        >
          WELCOME SCREEN
        </button>
      </div>
    </div>
  );
};

export default Landing;
