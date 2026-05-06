import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const guestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

const Register = () => {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const desk = searchParams.get("desk") === "2" ? "2" : "1";

  useEffect(() => {
    document.title = `STORIFY — Registration Desk ${desk}`;
    nameRef.current?.focus();
  }, [desk]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const parsed = guestSchema.safeParse({ name });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("guests").insert({
      name: parsed.data.name,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Could not add guest");
      return;
    }

    setName("");
    toast.success("Added successfully");
    nameRef.current?.focus();
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tight text-foreground">
            STOR<span className="text-primary text-glow-red">I</span>FY
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.4em] text-muted-foreground">
            Guest Registration · Desk {desk}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl"
        >
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Name
            </label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              autoComplete="off"
              required
              className="w-full bg-input/60 border border-border rounded-lg px-4 py-3.5 text-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-7 w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-bold text-lg py-4 rounded-lg transition shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_45px_hsl(var(--primary)/0.6)]"
          >
            {submitting ? "Adding…" : "Add Guest"}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-muted-foreground/60 uppercase tracking-widest">
          Press Enter to submit
        </p>
      </div>
    </main>
  );
};

export default Register;
