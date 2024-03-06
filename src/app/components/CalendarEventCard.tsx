import React, { useEffect, useRef, useState } from "react";

// @ts-ignore
import useSound from "use-sound";

import useGoogleAuthedQuery from "../../../hooks/useGoogleAuthedQuery";
// import { getCalendarEvent } from "../../../utils/googleApiQueries";

import { IAppCalendarEvent } from "../../../interfaces/IAppCalendarEvent.interface";
import moment from "moment";
import _ from "lodash";
import axios from "axios";
import { IGoogleAPICalendarEvent } from "../../../interfaces/IGoogleAPICalendarEvent.interface";
import EventWrapper from "./EventWrapper";

const CalendarEventCard = () => {
  const [play, { stop }] = useSound("./alarm.mp3", { volume: 0.1 });

  const [isWithinAlarmTime, setIsWithinAlarmTime] = useState(false);
  const [isAlarmTurnedOff, setIsAlarmTurnedOff] = useState(false);

  const [currentCalendarEvent, setCurrentCalendarEvent] = useState<
    IAppCalendarEvent | null | undefined
  >(undefined);

  const prevCalendarEventRef = useRef<IAppCalendarEvent | null | undefined>(
    undefined
  );

  useEffect(() => {
    const previousCalendarEvent = prevCalendarEventRef.current;

    if (previousCalendarEvent?.id !== currentCalendarEvent?.id) {
      setIsAlarmTurnedOff(false);
      prevCalendarEventRef.current = currentCalendarEvent;
    }

    if (!currentCalendarEvent) {
      setIsAlarmTurnedOff(false);
      setIsWithinAlarmTime(false);
      stop();
    }
  }, [currentCalendarEvent, stop]);

  /**
   * Retrieves the nearest upcoming event from the user's Google Calendar.
   * @param accessToken Access token for Google Calendar API authorization.
   * @returns A promise that resolves to the nearest upcoming event's details, or null if no upcoming event is found.
   */
  const getCalendarEvent = async (
    accessToken: string
  ): Promise<IAppCalendarEvent | null> => {
    // const currentEvent = {} as IAppCalendarEvent;
    // Get the current time in UTC
    const currentTimeUTC = moment.utc();

    let timeMin;

    if (!currentCalendarEvent) {
      timeMin = currentTimeUTC.clone().add(11, "minutes");
    } else {
      timeMin = currentTimeUTC;
    }

    const timeMinParam = timeMin.format("YYYY-MM-DDTHH:mm:ss[Z]");

    //  Format the current time in RFC3339 with the mandatory time zone offset according to google api documentation. See for timeMin param: https://developers.google.com/calendar/api/v3/reference/events/list

    try {
      // Fetch calendar events from Google Calendar API
      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${timeMinParam}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      // Find the nearest upcoming event
      const nearestFirst: IGoogleAPICalendarEvent = data.items.find(
        (event: IGoogleAPICalendarEvent) => {
          if (event.start && event.start.dateTime) {
            const eventStartTime = moment.utc(event.start.dateTime);

            // Return true if the event start time is same as or after the current time
            // Note: Google Calendar API may return events with a start time in the past
            // but an end time in the future, hence we filter based on start time only.
            return eventStartTime.isSameOrAfter(currentTimeUTC);
          }
        }
      );

      let returnValue: IAppCalendarEvent | null | undefined;

      const newEvent: IAppCalendarEvent | null = nearestFirst
        ? {
            id: nearestFirst.id,
            startDateTime: moment.utc(nearestFirst.start.dateTime),
            summary: nearestFirst.summary,
          }
        : null;

      if (!currentCalendarEvent) {
        returnValue = newEvent;
      } else if (
        newEvent?.startDateTime
          .clone()
          .subtract(10, "minutes")
          .isAfter(currentTimeUTC) &&
        newEvent?.startDateTime.isBefore(currentCalendarEvent?.startDateTime)
      ) {
        returnValue = newEvent;
      } else if (
        currentTimeUTC.isAfter(
          currentCalendarEvent?.startDateTime?.clone().add(11, "minutes")
        )
      ) {
        returnValue = newEvent || null;
      } else {
        try {
          const updatedCurrentEvent = await axios.get<IGoogleAPICalendarEvent>(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events/${currentCalendarEvent.id}?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (updatedCurrentEvent.data.status === "cancelled") {
            returnValue = newEvent;
          } else if (
            moment
              .utc()
              .isSameOrBefore(
                moment
                  .utc(updatedCurrentEvent.data.start.dateTime)
                  .clone()
                  .add(10, "minutes")
              )
          ) {
            returnValue = {
              id: updatedCurrentEvent.data.id,
              summary: updatedCurrentEvent.data.summary,
              startDateTime: moment.utc(
                updatedCurrentEvent.data.start.dateTime
              ),
            };
          } else {
            returnValue = newEvent;
          }
          //  else {
          //   returnValue = currentCalendarEvent;
          // }
        } catch (error) {
          returnValue = newEvent;
        }
      }

      if (
        moment
          .utc()
          .isSameOrAfter(
            moment
              .utc(returnValue?.startDateTime)
              .clone()
              .subtract(10, "minutes")
          ) &&
        moment
          .utc()
          .isSameOrBefore(
            moment.utc(returnValue?.startDateTime).clone().add(11, "minutes")
          )
      ) {
        setIsWithinAlarmTime(true);
      } else {
        setIsWithinAlarmTime(false);
      }

      setCurrentCalendarEvent(returnValue);

      return returnValue;
    } catch (error: any) {
      throw error;
    }
  };

  const {
    error,
    data: calendarEvent,
    isPending,
    isSuccess,
  } = useGoogleAuthedQuery<IAppCalendarEvent | null>({
    queryKey: ["calendar-event"],
    queryFn: () =>
      getCalendarEvent(localStorage.getItem("accessToken") as string),
    refetchInterval: 1000,
    retry: false,
  });

  return (
    <EventWrapper isEvent={!!currentCalendarEvent}>
      {isSuccess && (
        <div>
          {currentCalendarEvent === null ||
          currentCalendarEvent === undefined ? (
            <div className="text-5xl text-custom-blue text-center leading-normal">
              <h2>
                dude, you’ve got like, nothing on your calendar bro. Awesome 🏄
              </h2>
            </div>
          ) : (
            <>
              {currentCalendarEvent && (
                <div
                  className={`p-20 border-[3px] border-custom-gray rounded-3xl ${
                    isWithinAlarmTime && !isAlarmTurnedOff ? "vibrate-1" : ""
                  }`}
                >
                  <div className="">
                    <h1 className="text-[96px] font-bold leading-none w-full  overflow-ellipsis line-clamp-2">
                      {currentCalendarEvent.summary || "(No title)"}
                    </h1>
                  </div>
                  <div className="flex justify-between items-center mt-[55px]">
                    <span className="text-[36px]">
                      {moment(currentCalendarEvent.startDateTime)
                        .local()
                        .format("h:mm a")}
                    </span>
                    <span className="text-[36px]">
                      {currentCalendarEvent.startDateTime.format("ddd, MMM DD")}
                    </span>
                  </div>
                  {!isAlarmTurnedOff && isWithinAlarmTime && play()}
                  <button
                    className={`bg-custom-blue text-white p-[26px] w-full text-[36px] rounded-3xl mt-[55px] ${
                      isAlarmTurnedOff && "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={() => {
                      setIsAlarmTurnedOff(true);
                      stop();
                    }}
                    disabled={isAlarmTurnedOff}
                  >
                    Ok, I got it!
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {isPending && (
        <h1 className="text-5xl text-custom-blue text-center leading-normal">
          Just a second...
        </h1>
      )}
      {/*  @ts-ignore */}
      {error && error?.response?.status === 401 ? (
        <h1 className="text-5xl text-custom-blue text-center leading-normal">
          Just a second...
        </h1>
      ) : (
        error && (
          <h1 className="text-5xl text-custom-blue text-center leading-normal">
            We{`'`}re sorry. Apparently there are problems with the network
            request to the Google calendar API. Try reloading the page or
            signing in again.
          </h1>
        )
      )}
    </EventWrapper>
  );
};

export default CalendarEventCard;
