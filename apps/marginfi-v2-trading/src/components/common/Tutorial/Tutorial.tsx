import React from "react";

import Link from "next/link";

import { motion } from "framer-motion";
import { IconAlertTriangle, IconTrendingUp, IconCoins, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";

import { IconArena } from "~/components/ui/icons";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Progress } from "~/components/ui/progress";

import { type CarouselApi } from "~/components/ui/carousel";

const tutorialSlides = [
  {
    icon: <IconTrendingUp />,
    heading: "How trading on The Arena works",
    body: "Long and short your favorite token in one click. Enabled by marginfi's isolated lending groups and flashloans.",
  },
  {
    icon: <IconCoins />,
    heading: "The Arena pools must have liquidity",
    body: "If you're a hodler, deposit your token and earn over-collateralized yield. If you're a yield farmer, deposit USDC to earn incredible rates. If you're a smol fish, share with friends to get deposits to lever long your token..",
  },
  {
    icon: <IconAlertTriangle />,
    heading: "Be aware of the risks",
    body: (
      <>
        Pool creation is permissionless, be sure to do your own research on pool creators and oracles.{" "}
        <Link
          href="https://docs.marginfi.com/the-arena"
          className="border-b border-primary transition-colors hover:border-transparent"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more
        </Link>
        .
      </>
    ),
  },
];

export const Tutorial = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [checked, setChecked] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleDialogClose = () => {
    localStorage.setItem("arenaTutorialAcknowledged", "true");
    setOpen(false);
  };

  React.useEffect(() => {
    if (!localStorage.getItem("arenaTutorialAcknowledged")) {
      setOpen(true);
      return;
    }
  }, []);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!open) return null;

  return (
    <div className="mrgn-bg-gradient fixed top-0 left-0 w-screen h-screen bg-background md:max-w-none md:max-h-none md:h-screen z-[999999]">
      <Progress value={current > 1 ? (current / count) * 100 : 0} />
      <motion.div
        className="w-full h-full flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Carousel setApi={setApi} className="w-full text-primary/80 md:max-w-4xl" opts={{ duration: 0 }}>
          <CarouselContent>
            <CarouselItem>
              <div className="flex flex-col gap-12 items-center justify-center text-center px-4 md:px-0 md:max-w-2xl md:mx-auto">
                <header className="flex flex-col gap-8 items-center justify-center">
                  <IconArena size={68} />
                  <div className="text-center space-y-4">
                    <h2 className="text-primary font-medium text-4xl font-orbitron md:text-5xl">
                      Welcome to the arena
                    </h2>
                    <h3 className="md:text-2xl">Long / short anything on Solana... with leverage.</h3>
                  </div>
                </header>
                <Button onClick={() => api?.scrollNext()}>Get started</Button>
              </div>
            </CarouselItem>
            {tutorialSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="flex flex-col gap-8 items-center justify-center text-center h-full px-8 md:px-0 md:max-w-2xl md:mx-auto">
                  <div className="flex flex-col gap-4 items-center justify-center">
                    <header className="flex flex-col gap-4 items-center justify-center">
                      {React.cloneElement(slide.icon, { size: 42 })}
                      <h2 className="text-primary font-medium text-3xl md:text-4xl">{slide.heading}</h2>
                    </header>
                    <p className="md:text-lg">{slide.body}</p>
                    <div className="flex items-center gap-3 pt-4">
                      <Button onClick={() => api?.scrollPrev()} variant="outline" className="pl-2">
                        <IconChevronLeft size={16} /> Back
                      </Button>
                      <Button onClick={() => api?.scrollNext()} variant="outline" className="pr-2">
                        Next <IconChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
            <CarouselItem>
              <div className="flex flex-col gap-10 items-center justify-center text-center px-4 md:px-0 md:max-w-2xl md:mx-auto">
                <header className="flex flex-col gap-8 items-center justify-center">
                  <IconArena size={68} />
                  <div className="text-center space-y-8">
                    <h2 className="text-primary font-medium text-4xl font-orbitron md:text-5xl">Are you ready?</h2>
                    <Label
                      htmlFor="arena-tutorial-checkbox"
                      className="bg-accent/50 p-4 rounded-lg flex text-left md:items-center gap-4 leading-tight"
                    >
                      <Checkbox
                        id="arena-tutorial-checkbox"
                        checked={checked}
                        onCheckedChange={() => setChecked(!checked)}
                      />{" "}
                      I understand the risks and want to enter the arena and try some stuff
                    </Label>
                  </div>
                </header>
                <div className="flex items-center gap-3">
                  <Button onClick={() => api?.scrollPrev()} variant="outline" className="pl-2">
                    <IconChevronLeft size={16} /> Back
                  </Button>
                  <Button onClick={() => handleDialogClose()} className="flex items-center gap-3" disabled={!checked}>
                    <IconArena className="text-white" size={16} /> Enter The Arena
                  </Button>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          {current > 1 && current < count && <CarouselPrevious />}
          {current > 1 && current < count && <CarouselNext />}
        </Carousel>
      </motion.div>
    </div>
  );
};
