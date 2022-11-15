import React, { cloneElement, useRef, ReactElement, Children } from "react";

interface Props {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoTaken?: (photo: File) => void;
  children: ReactElement | Array<ReactElement>;
  id?: string;
  hidden?: boolean;
}

function Camera(props: Props) {
  const { onChange, children, onPhotoTaken, id, hidden = true } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const onClick = () => {
    if (inputRef.current) inputRef.current.click();
  };

  const handleCameraChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    console.log(event.target.clientHeight);

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
        capture="environment"
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
