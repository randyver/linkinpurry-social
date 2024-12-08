import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function About() {
  const navigate = useNavigate();
  const teamMembers = [
    {
      image: "salsa-pic.png",
      name: "Salsabiila",
      id: "13522062",
    },
    {
      image: "randy-pic.png",
      name: "Randy Verdian",
      id: "13522067",
    },
    {
      image: "juan-pic.png",
      name: "Juan Alfred Widjaya",
      id: "13522073",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll(".scroll-animate");
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          el.classList.add("visible");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <main className="min-h-screen bg-wbd-background px-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <DynamicBackground />
      </div>

      <section className="flex flex-col items-left justify-center min-h-screen px-4 sm:px-8 md:px-16 lg:px-32 xl:px-80 text-left relative">
        <h1 className="text-5xl text-wbd-primary font-bold mb-6 leading-tight">
          <span className="block">Linkinpurry</span>
          <span className="text-wbd-highlight text-4xl">
            Connecting with Purpose
          </span>
        </h1>
        <p className="text-lg text-wbd-text max-w-2xl lg:mx-0 mb-8 leading-relaxed">
          Linkinpurry is a platform designed to enable meaningful connections
          and inspire creative collaboration. By focusing on authenticity and
          shared experiences, it offers a refreshing alternative to the noise of
          traditional social media.
        </p>

        <div
          className="flex items-center space-x-2 mt-4 cursor-pointer group"
          onClick={() => navigate("/userlist")}
        >
          <p className="text-wbd-primary font-medium text-xl transition-all duration-200 ease-in-out group-hover:scale-105">
            Explore Our Community
          </p>

          <ArrowRight className="text-wbd-primary h-7 w-7 transform transition-transform duration-200 ease-out group-hover:translate-x-3 group-hover:scale-105" />
        </div>
      </section>

      <section className="relative py-20">
        <div className="relative w-full h-[800px] lg:h-[900px] flex flex-col items-center justify-center">
          <h2 className="absolute text-5xl text-wbd-primary font-bold text-center mb-6 hidden lg:block">
            Meet Our Team
          </h2>

          <div className="relative w-full h-full">
            <div className="absolute top-0 right-[30%] transform -translate-x-1/2 scroll-animate hidden lg:block">
              <TeamMember member={teamMembers[2]} />
            </div>
            <div className="absolute bottom-[35%] left-[20%] transform scroll-animate hidden lg:block">
              <TeamMember member={teamMembers[1]} />
            </div>
            <div className="absolute bottom-[1%] right-[25%] transform scroll-animate hidden lg:block">
              <TeamMember member={teamMembers[0]} />
            </div>

            <h2 className="text-3xl text-wbd-primary font-bold text-center mb-6 lg:hidden">
              Meet Our Team
            </h2>

            <div className="flex flex-col items-center space-y-6 lg:hidden">
              <div className="scroll-animate">
                <TeamMember member={teamMembers[0]} />
              </div>
              <div className="scroll-animate">
                <TeamMember member={teamMembers[1]} />
              </div>
              <div className="scroll-animate">
                <TeamMember member={teamMembers[2]} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
            @keyframes fadeInUp {
              from {
                  opacity: 0;
                  transform: translateY(30px);
              }
              to {
                  opacity: 1;
                  transform: translateY(0);
              }
            }

            .scroll-animate {
              opacity: 0;
              transform: translateY(30px);
              transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }

            .scroll-animate.visible {
              opacity: 1;
              transform: translateY(0);
            }
        `}
      </style>
    </main>
  );
}

interface TeamMemberProps {
  member: {
    image: string;
    name: string;
    id: string;
  };
}

const TeamMember: React.FC<TeamMemberProps> = ({ member }) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="rounded-full w-60 h-60 overflow-hidden shadow-lg">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-wbd-primary font-semibold text-xl mt-4">
        {member.name}
      </h3>
      <p className="text-wbd-text text-sm">{member.id}</p>
    </div>
  );
};

const DynamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();

    const nodes: {
      x: number;
      y: number;
      radius: number;
      dx: number;
      dy: number;
    }[] = [];
    const maxNodes = 50;

    const addNode = () => {
      if (nodes.length < maxNodes) {
        nodes.push({
          x: (Math.random() * canvas.width) / (window.devicePixelRatio || 1),
          y: (Math.random() * canvas.height) / (window.devicePixelRatio || 1),
          radius: 6 + Math.random() * 10,
          dx: (Math.random() - 0.5) * 0.4,
          dy: (Math.random() - 0.5) * 0.4,
        });
      }
    };

    const connectNodes = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(
            nodes[i].x - nodes[j].x,
            nodes[i].y - nodes[j].y,
          );
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 0, 0, ${1 - dist / 150})`;
            ctx.lineWidth = 1;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const drawNodes = () => {
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#F4BF77";
        ctx.fill();
      });
    };

    const updateNodes = () => {
      nodes.forEach((node) => {
        node.x += node.dx;
        node.y += node.dy;

        if (
          node.x < 0 ||
          node.x > canvas.width / (window.devicePixelRatio || 1)
        )
          node.dx *= -1;
        if (
          node.y < 0 ||
          node.y > canvas.height / (window.devicePixelRatio || 1)
        )
          node.dy *= -1;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawNodes();
      connectNodes();
      updateNodes();
      requestAnimationFrame(animate);
    };

    const interval = setInterval(addNode, 700);
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full filter blur-md" />;
};
