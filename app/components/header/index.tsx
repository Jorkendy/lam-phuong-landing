"use client";
import { RouterRoot } from "@/app/constants";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const MENU_ITEMS = [
  { label: "HOME", key: RouterRoot.Home },
  { label: "ABOUT", key: RouterRoot.About },
  { label: "OUR SERVICES", key: RouterRoot.Service },
  { label: "CASE STUDIES", key: RouterRoot.Studies },
  { label: "CAREERS", key: RouterRoot.Career },
  { label: "OUR PARTNERS", key: RouterRoot.Partner },
];

type MenuItem = (typeof MENU_ITEMS)[number];

const SideBar = ({ activeMenu }: { activeMenu: string }) => {
  const [showSideBar, setShowSideBar] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const openSideBar = () => setShowSideBar(true);
  const closeSideBar = useCallback(() => setShowSideBar(false), []);

  useEffect(() => {
    if (!showSideBar) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSideBar();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [showSideBar, closeSideBar]);

  return (
    <Fragment>
      <button
        ref={triggerRef}
        type="button"
        className="lg:hidden"
        onClick={openSideBar}
        aria-label="Mở menu"
        aria-expanded={showSideBar}
        aria-controls="mobile-menu"
      >
        <svg width="16" height="12" aria-hidden="true">
          <use href="/images/icons.svg#icon-navbar"></use>
        </svg>
      </button>
      {showSideBar && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu chính"
          className="fixed top-0 left-0 w-full h-screen bg-white p-8 mobile-bar overflow-auto"
        >
          <div className="flex justify-between items-center mb-5">
            <Link href="/">
              <Image
                src="/images/logo.png"
                alt="Lam Phương"
                width={260}
                height={68}
                priority
                sizes="(max-width: 1280px) 160px, 260px"
                className="w-[160px] xl:w-[260px] h-auto"
              />
            </Link>
            <button
              ref={closeRef}
              type="button"
              className="lg:hidden relative z-9"
              onClick={closeSideBar}
              aria-label="Đóng menu"
            >
              <svg width="14" height="14" aria-hidden="true">
                <use href="/images/icons.svg#icon-close"></use>
              </svg>
            </button>
          </div>
          <ul>
            {MENU_ITEMS.map((menu) => {
              const url = `#${menu.key}`;
              return (
                <li key={menu.key} className="py-5">
                  <Link
                    href={url}
                    scroll={false}
                    onClick={(e) => {
                      e.preventDefault();
                      const targetId = menu.key;
                      const targetElement = document.getElementById(targetId);
                      const headerHeight =
                        document.querySelector("header")?.offsetHeight || 0;

                      if (targetElement) {
                        const targetPosition =
                          targetElement.offsetTop - headerHeight - 10;
                        window.scrollTo({
                          top: targetPosition,
                          behavior: "smooth",
                        });
                      }

                      setShowSideBar(false);
                    }}
                    className={clsx(
                      "text-primary rounded-3xl cursor-pointer transition px-5",
                      {
                        "bg-primary text-white":
                          activeMenu === url &&
                          activeMenu !== `#${RouterRoot.Home}`,
                        "hover:bg-primary hover:text-white": activeMenu !== url,
                      },
                    )}
                  >
                    {menu.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Fragment>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();

  useGSAP(() => {
    gsap.fromTo(
      ".link-menu",
      { visibility: "visible", opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: "power2.out",
        delay: 0.5,
        stagger: (i) => 0.25 * i,
      },
    );
  }, []);

  useEffect(() => {
    const headerHeight = document.querySelector("header")?.offsetHeight || 0;
    const sections = document.querySelectorAll("section.section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveMenu(`#${id}`);
            if (id === RouterRoot.Home) {
              router.replace(pathname, { scroll: false });
              return;
            }
            router.push(`${pathname}#${id}`, { scroll: false });
          }
        });
      },
      { threshold: 0.7, rootMargin: `-${headerHeight}px 0px 0px 0px` },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [pathname, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveMenu(window.location.hash);
      setScrolled(window.scrollY > 70);
    }
    const handleScroll = () => setScrolled(window.scrollY > 70);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onClick = useCallback(
    (menu: MenuItem) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (pathname !== "/") {
        router.push(`/#${menu.key}`);
        return;
      }
      const targetId = menu.key;
      const targetElement = document.getElementById(targetId);
      const headerHeight =
        document.querySelector("header")?.offsetHeight || 0;

      if (targetElement) {
        const targetPosition =
          targetElement.offsetTop - headerHeight - 10;
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    },
    [pathname, router],
  );

  return (
    <header
      className={clsx("fixed w-full z-10 transition-all duration-300", {
        "scroll bg-white shadow-lg": scrolled,
      })}
    >
      <div className="container mx-auto p-6 lg:px-8 lg:py-2">
        <div className="flex justify-between items-center">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="Lam Phương"
              width={260}
              height={68}
              priority
              sizes="(max-width: 1280px) 160px, 260px"
              className="w-[160px] xl:w-[260px] h-auto link-menu"
            />
          </Link>
          <div className="menu hidden md:hidden xl:block">
            <ul className="flex gap-8">
              {MENU_ITEMS.map((menu) => {
                const url = `/#${menu.key}`;

                return (
                  <li key={menu.key}>
                    <Link
                      href={url}
                      scroll={false}
                      onClick={onClick(menu)}
                      className={clsx(
                        "text-primary px-5 py-2 rounded-3xl cursor-pointer transition link-menu",
                        {
                          "bg-primary text-white":
                            activeMenu === url &&
                            activeMenu !== `#${RouterRoot.Home}`,
                          "hover:bg-primary hover:text-white":
                            activeMenu !== url,
                        },
                      )}
                    >
                      {menu.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <SideBar activeMenu={activeMenu} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
