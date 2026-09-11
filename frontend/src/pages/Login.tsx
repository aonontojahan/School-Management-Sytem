import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        className="bg-white p-8 rounded shadow w-96 space-y-4"
        onSubmit={handleSubmit(async (v) => {
          await login(v.email, v.password);
          nav("/");
        })}
      >
        <h1 className="text-xl font-bold">School Management System</h1>
        <div>
          <input className="border w-full px-3 py-2 rounded" placeholder="Email" {...register("email")} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <input className="border w-full px-3 py-2 rounded" type="password" placeholder="Password" {...register("password")} />
        </div>
        <button disabled={isSubmitting} className="bg-black text-white w-full py-2 rounded">
          {isSubmitting ? "Signing in…" : "Login"}
        </button>
        <p className="text-xs text-gray-500">Seeded admin: admin@school.local / Admin123!</p>
      </form>
    </div>
  );
}
