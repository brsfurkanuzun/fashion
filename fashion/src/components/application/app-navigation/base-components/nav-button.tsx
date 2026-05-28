import type { FC, MouseEventHandler, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Pressable } from "react-aria-components";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { cx } from "@/lib/utils/cx";

interface NavButtonProps {
    /** Whether the collapsible nav item is open. */
    open?: boolean;
    /** URL to navigate to when the button is clicked. */
    href?: string;
    /** Label text for the button. */
    label?: string;
    /** Icon component to display. */
    icon?: FC<{ className?: string }>;
    /** Whether the button is currently active. */
    current?: boolean;
    /** Handler for click events. */
    onClick?: MouseEventHandler;
    /** Additional CSS classes to apply to the button. */
    className?: string;
    /** Placement of the tooltip. */
    tooltipPlacement?: "top" | "right" | "bottom" | "left";
    /** Content to display. */
    children?: ReactNode;
}

export const NavButton = ({ current, label, href, icon: Icon, className, tooltipPlacement = "right", onClick, children }: NavButtonProps) => {
    const iconOnly = !children;
    const isInternal = href?.startsWith("/");
    const linkClass = cx(
        "group/item relative flex w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-white transition duration-100 ease-linear select-none hover:bg-black/[0.04] focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 dark:bg-[#141414] dark:hover:bg-white/[0.06] dark:focus-visible:outline-zinc-700",
        current && "bg-black/[0.06] hover:bg-black/[0.08] dark:bg-white/[0.08] dark:hover:bg-white/[0.12]",
        iconOnly ? "size-9" : "px-2 py-1.5",
        className,
    );

    const linkContent = (
        <>
                    {Icon && (
                        <Icon
                            aria-hidden="true"
                            className={cx(
                                "size-5 shrink-0 text-zinc-400 transition-inherit-all group-hover/item:text-zinc-600 dark:text-zinc-500 dark:group-hover/item:text-zinc-200",
                                current && "text-zinc-700 dark:text-zinc-100",
                            )}
                        />
                    )}

                    {children && (
                        <span
                            className={cx(
                                "px-0.5 text-sm font-semibold text-zinc-600 transition duration-100 ease-linear group-hover/item:text-zinc-900 dark:text-zinc-300 dark:group-hover/item:text-zinc-50",
                                current && "text-zinc-900 dark:text-zinc-50",
                            )}
                        >
                            {children}
                        </span>
                    )}
        </>
    );

    return (
        <Tooltip isDisabled={!label} title={label} placement={tooltipPlacement}>
            <Pressable>
                {isInternal && href ? (
                    <Link to={href} aria-label={label} onClick={onClick} className={linkClass}>
                        {linkContent}
                    </Link>
                ) : (
                    <a href={href} aria-label={label} onClick={onClick} className={linkClass}>
                        {linkContent}
                    </a>
                )}
            </Pressable>
        </Tooltip>
    );
};
