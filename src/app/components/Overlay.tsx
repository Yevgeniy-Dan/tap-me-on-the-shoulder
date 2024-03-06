import { Dispatch, SetStateAction } from "react";

const Overlay = ({
  setModal,
}: {
  setModal: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="absolute top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-10 flex justify-center items-center">
      <div className="p-[5vw] w-[30vw] border-[0.2vw] border-ourGray rounded-[1.4vw] bg-white">
        <button
          onClick={() => setModal(false)}
          className="bg-custom-blue text-white py-[2vw] w-full text-[2vw] rounded-[1.4vw]"
        >
          Accept sound
        </button>
      </div>
    </div>
  );
};

export default Overlay;
