import type { ReactElement, InputHTMLAttributes } from "react";
import type React from "react";
import { cloneElement, useRef, Children } from "react";

interface Props {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoTaken?: (photo: File) => void;
  children: ReactElement | Array<ReactElement>;
  id?: string;
  hidden?: boolean;
  inputCapture?: InputHTMLAttributes<HTMLInputElement>["capture"];
}

function Camera(props: Props) {
  const {
    onChange,
    children,
    onPhotoTaken,
    id,
    hidden = true,
    inputCapture = "environment",
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const onClick = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;

    if (files && files[0]) {
      onPhotoTaken?.(files[0]);
    }
    onChange?.(event);
  };

  return (
    <>
      <input
        id={id}
        type="file"
        accept="image/*"
        capture={inputCapture}
        ref={inputRef}
        style={{ display: hidden ? "none" : "inline-block" }}
        onChange={handleCameraChange}
      />
      {Children.map(children, (child) => {
        return cloneElement(child, {
          onClick,
        });
      })}
    </>
  );
}

export default Camera;
