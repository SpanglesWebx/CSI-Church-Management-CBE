import React from "react";

const tamilKeys = [
  ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"],
  ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம", "ய"],
  ["ர", "ல", "வ", "ழ", "ள", "ற", "ன", "ஶ", "ஷ", "ஸ", "ஹ"],
  ["்", "ா", "ி", "ீ", "ு", "ூ", "ெ", "ே", "ை", "ொ", "ோ", "ௌ"],
];

export const TamilKeyboardOverlay = ({ onSelect, onClose }) => {
  const styles = {
    overlay: `
      fixed inset-0 bg-black bg-opacity-40 
      flex items-center justify-center z-50
    `,
    keyboard: `
      bg-white rounded-lg shadow-xl p-4 w-[90%] max-w-xl 
      animate-fadeIn
    `,
    keyRow: "flex justify-center gap-2 mb-2",
    key: `
      bg-gray-200 hover:bg-gray-300 
      rounded-md px-3 py-2 text-xl cursor-pointer 
      transition
    `,
    controlRow: "flex justify-between mt-3",
    controlBtn: `
      bg-red-500 text-white rounded-md px-4 py-2 cursor-pointer
    `,
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.keyboard} onClick={(e) => e.stopPropagation()}>
        {tamilKeys.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.keyRow}>
            {row.map((key) => (
              <button
                key={key}
                className={styles.key}
                onClick={() => onSelect(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}

        <div className={styles.controlRow}>
          <button className={styles.controlBtn} onClick={() => onSelect("BACKSPACE")}>
            Backspace
          </button>
          <button className={styles.controlBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
