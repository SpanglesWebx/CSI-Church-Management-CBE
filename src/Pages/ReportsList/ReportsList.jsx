import React, { useState } from 'react';
// import './Sidebar.css'
import { useEffect } from 'react';

const Sidebar = ({ active, setActive } ) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const items = [
    'Birthday',
    'Marriage',
    'Baptism',
    'Communion',
    'Inactive',
    'Rejoining',
    'Auction Report',
    "Reminders"
  ];

  useEffect(() => {
    setActive(activeIndex);
  }, [activeIndex, setActive]);

  const handleClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <div className="bg-white w-44 ">
      <ul>
        {items.map((item, index) => (
          <li
            key={index}
            className={`p-4 cursor-pointer text-sm  not-italic font-normal text-[16px] leading-[19px] ${
              activeIndex === index ? 'bg-gray-100 text-lavender--600' : 'hover:bg-gray-300 hover:text-lavender--600'
            }`}
            onClick={() => handleClick(index)}
          >
            {item}
          </li>
        ))}
      </ul>
      <h1></h1>
    </div>
  );
};

export default Sidebar;
