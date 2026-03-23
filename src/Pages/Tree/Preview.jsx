import React, { useEffect, useRef, useState } from "react";
import accIcon from "../../assets/Mask group (2)-min.png";
import treeIcon from "../../assets/Group 1000001887-min.png";
import { useNavigate, useParams } from "react-router-dom";
import add from "../../assets/new/Group 244.png";
import pic from "../../assets/user-min.png";
import Tree from "react-d3-tree";

function Preview() {
  const params = useParams();
  const navigate = useNavigate();
  const LoginUser = JSON.parse(window.localStorage.getItem("user"));
  const treeContainerRef = useRef(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.8);

  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 10,
      });
    }
  }, []);

  const [FamilyData, setFamilyData] = useState({
    family_id: "",
    head: "",
    members: [
      {
        relationship_with_family_head: "",
        ref_id: "",
      },
    ],
  });
  const [Data, setData] = useState({
    reason_for_inactive: "",
    family_id: "",
    member_id: "",
    assigned_member_id: "",
    member_Name: "",
    member_tamil_Name: "",
    gender: "",
    date_of_birth: "",
    email: "",
    occupation: "",
    community: "",
    nationality: "",
    member_photo: "",
    permanent_address: {
      address: "",
      city: "",
      district: "",
      state: "",
      zip_code: "",
    },
    present_address: {
      address: "",
      city: "",
      district: "",
      state: "",
      zip_code: "",
    },
    baptized_date: "",
    communion_date: "",
    marriage_date: "",
    joined_date: "",
    left_date: "",
    status: "",
  });
  useEffect(() => {
    // fetchData();
  }, [params]);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${URL}/family/tree/${params.family_id}`
        // {
        //   headers: {
        //     Authorization: LoginUser.token,
        //   },
        // }
      );
      setData(response.data);
    } catch (error) {
      console.error(error);
      if (error.response.status === 401) {
        setResponse({
          status: "Failed",
          message: "Un Authorized! Please Login Again.",
        });
        setTimeout(() => {
          dispatch(Logout());
          window.sessionStorage.clear();
          navigate("/account/login");
        }, 5000);
      }
      if (error.response.status === 500) {
        setResponse({
          status: "Failed",
          message: "Server Unavailable!",
        });
        setTimeout(() => {
          setResponse({
            status: null,
            message: "",
          });
        }, 5000);
      }
    }
  };

  const treeData = [
    {
      name: "David",
      attributes: { id: "CSI202401" },
      nodeSvgShape: {
        shape: "image",
        shapeProps: { href: pic, width: 50, height: 50 },
      },
      // children: [
      //   {
      //     name: "Reenu",
      //     attributes: { id: "CSI202403" },
      //     nodeSvgShape: {
      //       shape: "image",
      //       shapeProps: { href: pic, width: 50, height: 50 },
      //     },
      children: [
        {
          name: "Joseph",
          attributes: { id: "CSI202405" },
          nodeSvgShape: {
            shape: "image",
            shapeProps: {
              href: pic,
              width: 50,
              height: 50,
            },
          },
          // children: [
          //   {
          //     name: "mercy",
          //     attributes: { id: "CSI202405" },
          //     nodeSvgShape: {
          //       shape: "image",
          //       shapeProps: {
          //         href: pic,
          //         width: 50,
          //         height: 50,
          //       },
          //     },
          //     children: [
          //       {
          //         name: "livin",
          //         attributes: { id: "CSI202405" },
          //         nodeSvgShape: {
          //           shape: "image",
          //           shapeProps: {
          //             href: pic,
          //             width: 50,
          //             height: 50,
          //           },
          //         },
          //         children: [
          //           {
          //             name: "Add",
          //             attributes: "",
          //             nodeSvgShape: {
          //               shape: "image",
          //               shapeProps: {
          //                 href: add,
          //                 width: 50,
          //                 height: 50,
          //               },
          //             },
          //           },
          //         ],
          //       },
          //       {
          //         name: "angelina",
          //         attributes: { id: "CSI202405" },
          //         nodeSvgShape: {
          //           shape: "image",
          //           shapeProps: {
          //             href: pic,
          //             width: 50,
          //             height: 50,
          //           },
          //         },
          //       },
          //     ],
          //   },
          //   // {
          //   //   name: "jacy",
          //   //   attributes: { id: "CSI202405" },
          //   //   nodeSvgShape: {
          //   //     shape: "image",
          //   //     shapeProps: {
          //   //       href: pic,
          //   //       width: 50,
          //   //       height: 50,
          //   //     },
          //   //   },
          //   //   children: [
          //   //     {
          //   //       name: "edwin",
          //   //       attributes: { id: "CSI202405" },
          //   //       nodeSvgShape: {
          //   //         shape: "image",
          //   //         shapeProps: {
          //   //           href: pic,
          //   //           width: 50,
          //   //           height: 50,
          //   //         },
          //   //       },
          //   //     },
          //   //   ],
          //   // },
          // ],
        },
        {
          name: "Juliana",
          attributes: { id: "CSI202405" },
          nodeSvgShape: {
            shape: "image",
            shapeProps: {
              href: pic,
              width: 50,
              height: 50,
            },
          },
        },
        {
          name: "Nancy",
          attributes: { id: "CSI202406" },
          nodeSvgShape: {
            shape: "image",
            shapeProps: {
              href: pic,
              width: 50,
              height: 50,
            },
          },
        },
      ],
      // },
      // {
      //   name: "jasmine",
      //   attributes: { id: "CSI202403" },
      //   nodeSvgShape: {
      //     shape: "image",
      //     shapeProps: { href: pic, width: 50, height: 50 },
      //   },
      //   children: [
      //     {
      //       name: "christopher",
      //       attributes: { id: "CSI202405" },
      //       nodeSvgShape: {
      //         shape: "image",
      //         shapeProps: {
      //           href: pic,
      //           width: 50,
      //           height: 50,
      //         },
      //       },
      //     },
      //     {
      //       name: "christina",
      //       attributes: { id: "CSI202405" },
      //       nodeSvgShape: {
      //         shape: "image",
      //         shapeProps: {
      //           href: pic,
      //           width: 50,
      //           height: 50,
      //         },
      //       },
      //     },
      //   ],
      // },
      // ],
    },
    {
      name: "David",
      attributes: { id: "CSI202401" },
      nodeSvgShape: {
        shape: "image",
        shapeProps: { href: pic, width: 50, height: 50 },
      },
      // children: [
      //   {
      //     name: "Reenu",
      //     attributes: { id: "CSI202403" },
      //     nodeSvgShape: {
      //       shape: "image",
      //       shapeProps: { href: pic, width: 50, height: 50 },
      //     },
      children: [
        {
          name: "Joseph",
          attributes: { id: "CSI202405" },
          nodeSvgShape: {
            shape: "image",
            shapeProps: {
              href: pic,
              width: 50,
              height: 50,
            },
          },
          // children: [
          //   {
          //     name: "mercy",
          //     attributes: { id: "CSI202405" },
          //     nodeSvgShape: {
          //       shape: "image",
          //       shapeProps: {
          //         href: pic,
          //         width: 50,
          //         height: 50,
          //       },
          //     },
          //     children: [
          //       {
          //         name: "livin",
          //         attributes: { id: "CSI202405" },
          //         nodeSvgShape: {
          //           shape: "image",
          //           shapeProps: {
          //             href: pic,
          //             width: 50,
          //             height: 50,
          //           },
          //         },
          //         children: [
          //           {
          //             name: "Add",
          //             attributes: "",
          //             nodeSvgShape: {
          //               shape: "image",
          //               shapeProps: {
          //                 href: add,
          //                 width: 50,
          //                 height: 50,
          //               },
          //             },
          //           },
          //         ],
          //       },
          //       {
          //         name: "angelina",
          //         attributes: { id: "CSI202405" },
          //         nodeSvgShape: {
          //           shape: "image",
          //           shapeProps: {
          //             href: pic,
          //             width: 50,
          //             height: 50,
          //           },
          //         },
          //       },
          //     ],
          //   },
          //   // {
          //   //   name: "jacy",
          //   //   attributes: { id: "CSI202405" },
          //   //   nodeSvgShape: {
          //   //     shape: "image",
          //   //     shapeProps: {
          //   //       href: pic,
          //   //       width: 50,
          //   //       height: 50,
          //   //     },
          //   //   },
          //   //   children: [
          //   //     {
          //   //       name: "edwin",
          //   //       attributes: { id: "CSI202405" },
          //   //       nodeSvgShape: {
          //   //         shape: "image",
          //   //         shapeProps: {
          //   //           href: pic,
          //   //           width: 50,
          //   //           height: 50,
          //   //         },
          //   //       },
          //   //     },
          //   //   ],
          //   // },
          // ],
        },
        {
          name: "Juliana",
          attributes: { id: "CSI202405" },
          nodeSvgShape: {
            shape: "image",
            shapeProps: {
              href: pic,
              width: 50,
              height: 50,
            },
          },
        },
        {
          name: "Nancy",
          attributes: { id: "CSI202406" },
          nodeSvgShape: {
            shape: "image",
            shapeProps: {
              href: pic,
              width: 50,
              height: 50,
            },
          },
        },
      ],
      // },
      // {
      //   name: "jasmine",
      //   attributes: { id: "CSI202403" },
      //   nodeSvgShape: {
      //     shape: "image",
      //     shapeProps: { href: pic, width: 50, height: 50 },
      //   },
      //   children: [
      //     {
      //       name: "christopher",
      //       attributes: { id: "CSI202405" },
      //       nodeSvgShape: {
      //         shape: "image",
      //         shapeProps: {
      //           href: pic,
      //           width: 50,
      //           height: 50,
      //         },
      //       },
      //     },
      //     {
      //       name: "christina",
      //       attributes: { id: "CSI202405" },
      //       nodeSvgShape: {
      //         shape: "image",
      //         shapeProps: {
      //           href: pic,
      //           width: 50,
      //           height: 50,
      //         },
      //       },
      //     },
      //   ],
      // },
      // ],
    },
  ];

  const renderCustomNode = ({ nodeDatum, toggleNode }) => {
    return (
      <g onClick={toggleNode}>
        {/* <circle r={15} fill="#8378FF" stroke="#8378FF" onClick={toggleNode} /> */}
        <image
          href={nodeDatum.nodeSvgShape.shapeProps.href}
          width="42"
          height="42"
          x="-20"
          y="-20"
        />
        <text fill="black" strokeWidth="0.1" x="25">
          {nodeDatum.name}
        </text>
        <text fill="#8378FF" strokeWidth="0.1" x="25" dy="20">
          {nodeDatum.attributes.id}
        </text>
      </g>
    );
  };

  return (
    <React.Fragment>
      <section className="w-full bg-slate-50 rounded-ss">
        <div className="space-y-5">
          <div className="w-full bg-white rounded-xl flex flex-col px-5 py-8 border border-lavender--600">
            <div className="flex items-center gap-20">
              <h1 className="text-lavender--600 font-semibold text-2xl">
                Tree View
              </h1>
              <div className="flex items-center gap-5">
                <img src={accIcon} alt="" className="w-10" />
                <div className="flex flex-col gap-1">
                  <h6 className=" text-base font-semibold">
                    {FamilyData && FamilyData.head}
                  </h6>
                  <p className=" text-xs text-gray-400">Family Head</p>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <img src={treeIcon} alt="" className="w-10" />
                <div className="flex flex-col gap-1">
                  <h6 className=" text-base font-semibold">
                    {params.family_id}
                  </h6>
                  <p className=" text-xs text-gray-400">Family Id</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white w-full h-full relative">
            <div
              className="w-full h-screen"
              id="treeWrapper"
              ref={treeContainerRef}
            >
              <Tree
                data={treeData}
                nodeSvgShape={{ shape: "circle", shapeProps: { r: 10 } }}
                renderCustomNodeElement={renderCustomNode}
                pathFunc="step"
                orientation="vertical"
                translate={translate}
                nodeSize={{ x: 300, y: 120 }}
                separation={{ siblings: 1, nonSiblings: 1 }}
                zoomable={false}
                zoom={zoom}
              />
            </div>
            <div className=" absolute top-10 right-10 z-50 inline-flex items-center gap-5">
              <div className="inline-flex px-5 py-2 gap-3 rounded-full border border-lavender--600">
                <button
                  onClick={() =>
                    setZoom((prevZoom) => Math.min(prevZoom + 0.2, 1))
                  }
                  className="text-lavender--600 px-3 py-1.5 rounded-full hover:bg-slate-100 focus:ring-2 focus:ring-lavender-light-400"
                >
                  <i class="fa-solid fa-magnifying-glass-plus"></i>
                </button>
                <div className="h-fill w-[1px] bg-slate-200 rounded-full"></div>
                <button
                  onClick={() =>
                    setZoom((prevZoom) => Math.max(prevZoom - 0.2, 0.4))
                  }
                  className="text-lavender--600 px-3 py-1.5 rounded-full hover:bg-slate-100 focus:ring-2 focus:ring-lavender-light-400"
                >
                  <i class="fa-solid fa-magnifying-glass-minus"></i>
                </button>
              </div>
              <button
                onClick={() => setZoom(0.8)}
                className="text-lavender--600 px-4 py-3 border border-lavender--600 rounded-full hover:bg-slate-100 focus:ring-2 focus:ring-lavender-light-400"
              >
                <i class="fa-solid fa-rotate-left"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
}

export default Preview;
