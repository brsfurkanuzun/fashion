import type { PropsWithChildren } from "react";
import { X as CloseIcon, Menu02 } from "@untitledui/icons";
import {
    Button as AriaButton,
    Dialog as AriaDialog,
    DialogTrigger as AriaDialogTrigger,
    Modal as AriaModal,
    ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import { UntitledLogo } from "@/components/foundations/logo/untitledui-logo";
import { cx } from "@/lib/utils/cx";

export const MobileNavigationHeader = ({ children }: PropsWithChildren) => {
    return (
        <AriaDialogTrigger>
            <header className="flex h-14 items-center justify-between border-b border-[rgba(0,0,0,0.08)] bg-white p-3 pl-4 lg:hidden dark:border-white/[0.08] dark:bg-[#141414]">
                <UntitledLogo className="h-6" />

                <AriaButton
                    aria-label="Expand navigation menu"
                    className="group flex items-center justify-center rounded-lg bg-white p-2 text-zinc-600 hover:bg-black/[0.04] hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-300 dark:bg-[#141414] dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-700"
                >
                    <Menu02 className="size-6 transition duration-200 ease-in-out group-aria-expanded:opacity-0" />
                    <CloseIcon className="absolute size-6 opacity-0 transition duration-200 ease-in-out group-aria-expanded:opacity-100" />
                </AriaButton>
            </header>

            <AriaModalOverlay
                isDismissable
                className={({ isEntering, isExiting }) =>
                    cx(
                        "fixed inset-0 z-50 cursor-pointer bg-overlay/70 pl-16 backdrop-blur-md lg:hidden",
                        isEntering && "duration-300 ease-in-out animate-in fade-in",
                        isExiting && "duration-200 ease-in-out animate-out fade-out",
                    )
                }
            >
                {({ state }) => (
                    <>
                        <AriaButton
                            aria-label="Close navigation menu"
                            onPress={() => state.close()}
                            className="fixed top-2.5 right-3 flex cursor-pointer items-center justify-center rounded-lg p-2 text-fg-white/70 outline-focus-ring hover:bg-white/10 hover:text-fg-white focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <CloseIcon className="size-6" />
                        </AriaButton>

                        <AriaModal className="ml-auto w-full max-w-74 cursor-auto will-change-transform">
                            <AriaDialog className="h-dvh outline-hidden focus:outline-hidden">{children}</AriaDialog>
                        </AriaModal>
                    </>
                )}
            </AriaModalOverlay>
        </AriaDialogTrigger>
    );
};
