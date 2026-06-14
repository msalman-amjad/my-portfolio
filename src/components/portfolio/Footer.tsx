import { Github, Linkedin, MessageCircle, Phone, Mail } from "lucide-react";
import type { Profile } from "@/lib/portfolio";

export function Footer({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();
  const wa = profile.whatsapp
    ? profile.whatsapp.startsWith("http")
      ? profile.whatsapp
      : `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`
    : null;

  return (
    <footer id="contact" className="border-t border-border/50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="glass-strong grid gap-8 rounded-3xl p-8 md:grid-cols-3">
          <div>
            <h3 className="text-2xl font-bold gradient-text">{profile.full_name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{profile.title}</p>
            <p className="mt-4 text-xs text-muted-foreground">© {year} All rights reserved.</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Get in touch
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              {profile.email && (
                <li>
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" /> {profile.email}
                  </a>
                </li>
              )}
              {profile.phone && (
                <li>
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="h-4 w-4" /> {profile.phone}
                  </a>
                </li>
              )}
              {wa && (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.7_0.18_150)] px-3 py-1.5 text-xs font-semibold text-background hover:scale-105 transition-transform"
                  >
                    <MessageCircle className="h-3 w-3" /> Chat on WhatsApp
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-primary">
              Find me online
            </h4>
            <div className="mt-3 flex gap-2">
              {profile.github_url && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={profile.github_url}
                  className="glass rounded-xl p-3 hover:scale-110 transition-transform"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={profile.linkedin_url}
                  className="glass rounded-xl p-3 hover:scale-110 transition-transform"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
