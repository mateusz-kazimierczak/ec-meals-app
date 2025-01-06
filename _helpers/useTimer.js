import { useEffect, useState } from "react";
import { set } from "react-hook-form";

export default useTimer = ({ nextCall }) => {
  const [time, setTime] = useState(undefined);

  const updateTimer = () => {
    setTime((oldTime) => {
      if (oldTime == undefined) return;
      if (oldTime <= 20 * 1000) { // wait an additional 20 seconds before calling the next function
        nextCall();
          return undefined;
      }

      return oldTime - 1000;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => updateTimer(), 1000);

    return () => clearInterval(interval);
  }, []);

  const setTimeExternal = (time) => {


    console.log("Setting time to: ", new Date(time));

    const untilUpdate =
      time -
      Date.now();

      setTime(untilUpdate);
  };

  return [constructTimerText(time), setTimeExternal];
};

const constructTimerText = (time) => {
  if (time == undefined || time < 0) return "00:00:00";
  const nextUpdateTime = [
    Math.floor((time / (1000 * 60 * 60)) % 24),
    Math.floor((time / 1000 / 60) % 60),
    Math.floor((time / 1000) % 60),
  ];

  return `${`${nextUpdateTime[0]}`.padStart(
    2,
    "0"
  )}:${`${nextUpdateTime[1]}`.padStart(
    2,
    "0"
  )}:${`${nextUpdateTime[2]}`.padStart(2, "0")}`;
};
