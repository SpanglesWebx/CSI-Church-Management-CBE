import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { URL } from "../../App";
import { FaArrowLeft, FaPlus, FaTrash } from "react-icons/fa";
import { FailedMessage, SuccessMessage } from "../../Components/ToastMessage";

export const EditEndeavourEvent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = window.sessionStorage.getItem("token");
  const event = location.state?.event;

  // --- Form state ---
  const [selectedEventBy, setSelectedEventBy] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [registerBefore, setRegisterBefore] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]); // student competitions
  const [teacherTags, setTeacherTags] = useState([]); // teacher competition names (tags)
  const [teacherCompEvents, setTeacherCompEvents] = useState([]);
  const [eventBys, setEventBys] = useState([]);
  const [Response, setResponse] = useState({ status: null, message: "" });
  const [input, setInput] = useState("");
  const [teacherInput, setTeacherInput] = useState("");
  const [errors, setErrors] = useState({});

  // --- Class grouping helpers ---
  // classEvents here are grouped by base class name (eg "Primary") not sections.
  // structure: { className: "Primary", competitions: [{competition, title}], sections: [<original section objects>] }
  const [classEvents, setClassEvents] = useState([]);
  // original section-level events from backend (to preserve participants)
  const [originalSectionEvents, setOriginalSectionEvents] = useState([]);
  // available class groups (Primary, Junior, Secondary...) provided by backend endpoint /event/groups
  const [classGroups, setClassGroups] = useState([]);
  // all classes (with section_name) used to expand a newly-created group into sections when needed
  const [allClasses, setAllClasses] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventBy, setNewEventBy] = useState("");

  // --- Initialize form from passed event ---
  useEffect(() => {
    if (!event) return;

    setSelectedEventBy(event.eventBy?._id || "");
    setEventName(event.eventName || "");
    setEventDate(event.eventDate ? event.eventDate.split("T")[0] : "");
    setRegisterBefore(event.registerBefore ? event.registerBefore.split("T")[0] : "");
    setVenue(event.venue || "");
    setDescription(event.description || "");
    setTags(event.studentCompetitions || []);
    setTeacherTags(event.teacherCompetitions || []);
    setTeacherCompEvents(
      event.teacherCompEvents && event.teacherCompEvents.length > 0
        ? [{ competitions: event.teacherCompEvents }]
        : [{ competitions: [{ competition: "", title: "" }] }]
    );

    // keep raw section events for participant preservation and grouping below
    const sections = event.classEvents || [];
    setOriginalSectionEvents(sections);

    // build grouped view from sections
    const groupsMap = {};
    sections.forEach((sec) => {
      // sec.className format expected "Primary - A" or similar
      const parts = (sec.className || "").split(" - ");
      const base = parts[0]?.trim() || sec.className || "Unknown";

      if (!groupsMap[base]) {
        groupsMap[base] = {
          className: base,
          competitionsMap: new Map(), // temporarily dedupe competitions & keep title preference
          sections: [],
        };
      }

      // store the section so we can preserve participants for this section later
      groupsMap[base].sections.push(sec);

      // merge competitions for the group: prefer non-empty title, first occurrence
      (sec.competitions || []).forEach((c) => {
        if (!c || !c.competition) return;
        const existing = groupsMap[base].competitionsMap.get(c.competition);
        if (!existing) {
          groupsMap[base].competitionsMap.set(c.competition, { competition: c.competition, title: c.title || "" });
        } else {
          // if existing has empty title but this one has non-empty title, prefer it
          if ((!existing.title || existing.title.trim() === "") && c.title && c.title.trim() !== "") {
            groupsMap[base].competitionsMap.set(c.competition, { competition: c.competition, title: c.title });
          }
        }
      });
    });

    // transform map into array suitable for UI
    const groupedArr = Object.values(groupsMap).map((g) => ({
      className: g.className,
      competitions: Array.from(g.competitionsMap.values()).length ? Array.from(g.competitionsMap.values()) : [{ competition: "", title: "" }],
      sections: g.sections, // keep original sections for preservation
    }));

    // If the event had no classEvents, seed a single empty group row
    setClassEvents(groupedArr.length ? groupedArr : [{ className: "", competitions: [{ competition: "", title: "" }], sections: [] }]);
  }, [event]);

  // --- Fetch class groups and full classes list and eventBys ---
  useEffect(() => {
    const fetch = async () => {
      try {
        const [gRes, allClsRes, evByRes] = await Promise.all([
          axios.get(`${URL}/endeavour-classes/event/groups`, { headers: { Authorization: token } }), // returns ["Primary","Junior"...]
          axios.get(`${URL}/endeavour-classes`, { headers: { Authorization: token } }), // returns full class docs with class_name and section_name
          axios.get(`${URL}/endeavour-events/eventby/all`, { headers: { Authorization: token } }),
        ]);
        setClassGroups(gRes.data || []); // array of group names
        setAllClasses(allClsRes.data?.classes || allClsRes.data || []); // array of {class_name, section_name, _id...}
        setEventBys(evByRes.data.eventBys || evByRes.data || []);
      } catch (err) {
        console.error("Error fetching class/groups/eventBy:", err);
      }
    };
    fetch();
  }, [token]);

  // --- Tag handlers ---
  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && input.trim()) {
      e.preventDefault();
      const newTag = input.trim();
      if (!tags.includes(newTag)) setTags((p) => [...p, newTag]);
      setInput("");
    }
  };
  const removeTag = (tagToRemove) => setTags((p) => p.filter((t) => t !== tagToRemove));

  const handleTeacherKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Tab") && teacherInput.trim()) {
      e.preventDefault();
      const newTag = teacherInput.trim();
      if (!teacherTags.includes(newTag)) setTeacherTags((p) => [...p, newTag]);
      setTeacherInput("");
    }
  };
  const removeTeacherTag = (tagToRemove) => setTeacherTags((p) => p.filter((t) => t !== tagToRemove));

  // --- Class group CRUD on UI (grouped) ---
  const addClassEvent = () => {
    setClassEvents((prev) => [...prev, { className: "", competitions: [{ competition: "", title: "" }], sections: [] }]);
  };

  const handleChange = (groupIndex, compIndex, field, value) => {
    setClassEvents((prev) => {
      const updated = prev.map((g) => ({ ...g, competitions: g.competitions.map((c) => ({ ...c })) }));
      const newErrors = { ...errors };

      if (field === "className") {
        // duplicate group check inside UI list
        const duplicate = updated.findIndex((g, idx) => idx !== groupIndex && g.className === value);
        if (duplicate !== -1 && value.trim() !== "") {
          newErrors[`class-${groupIndex}`] = `${value} is already selected above.`;
          setErrors(newErrors);
          updated[groupIndex].className = "";
          return updated;
        } else {
          delete newErrors[`class-${groupIndex}`];
          setErrors(newErrors);
          updated[groupIndex].className = value;
          return updated;
        }
      }

      if (field === "competition") {
        const competitions = updated[groupIndex].competitions.map((c) => c.competition);
        const isDuplicate = competitions.includes(value);
        if (isDuplicate && value.trim() !== "") {
          newErrors[`comp-${groupIndex}-${compIndex}`] = `${value} competition is already added for this class group.`;
          setErrors(newErrors);
          return prev;
        } else {
          delete newErrors[`comp-${groupIndex}-${compIndex}`];
          setErrors(newErrors);
          updated[groupIndex].competitions[compIndex][field] = value;
        }
      }

      if (field === "title") {
        updated[groupIndex].competitions[compIndex][field] = value;
      }

      return updated;
    });
  };

  const addCompetitionRow = (groupIndex) => {
    setClassEvents((prev) => {
      const updated = prev.map((g) => ({ ...g, competitions: [...g.competitions] }));
      const last = updated[groupIndex].competitions.at(-1);
      if (!last || !last.competition.trim() || !last.title.trim()) return prev;
      updated[groupIndex].competitions.push({ competition: "", title: "" });
      return updated;
    });
  };

  const deleteCompetitionRow = (groupIndex, compIndex) => {
    setClassEvents((prev) => {
      const updated = prev.map((g) => ({ ...g, competitions: [...g.competitions] }));
      updated[groupIndex].competitions.splice(compIndex, 1);
      if (updated[groupIndex].competitions.length === 0) updated[groupIndex].competitions = [{ competition: "", title: "" }];
      return updated;
    });
  };

  // --- Teacher comp handlers (unchanged semantics) ---
  const addTeacherCompBlock = () => setTeacherCompEvents((p) => [...p, { competitions: [{ competition: "", title: "" }] }]);
  const deleteTeacherCompBlock = (i) => setTeacherCompEvents((p) => p.filter((_, idx) => idx !== i));
  const addTeacherCompetitionRow = (blockIndex) => {
    setTeacherCompEvents((prev) => {
      const updated = prev.map((b) => ({ ...b, competitions: [...b.competitions] }));
      const last = updated[blockIndex].competitions.at(-1);
      if (!last || !last.competition.trim() || !last.title.trim()) return prev;
      updated[blockIndex].competitions.push({ competition: "", title: "" });
      return updated;
    });
  };
  const deleteTeacherCompetitionRow = (blockIndex, compIndex) => {
    setTeacherCompEvents((prev) => {
      const updated = prev.map((b) => ({ ...b, competitions: [...b.competitions] }));
      updated[blockIndex].competitions.splice(compIndex, 1);
      if (updated[blockIndex].competitions.length === 0) updated[blockIndex].competitions = [{ competition: "", title: "" }];
      return updated;
    });
  };
  const handleTeacherCompChange = (blockIndex, compIndex, field, value) => {
    setTeacherCompEvents((prev) => {
      const updated = prev.map((b) => ({ ...b, competitions: [...b.competitions] }));
      const newErrors = { ...errors };
      if (field === "competition") {
        const comps = updated[blockIndex].competitions.map((c) => c.competition);
        const isDup = comps.includes(value);
        if (isDup && value.trim() !== "") {
          newErrors[`teacher-comp-${blockIndex}-${compIndex}`] = `${value} is already added for this block`;
          setErrors(newErrors);
          return prev;
        } else {
          delete newErrors[`teacher-comp-${blockIndex}-${compIndex}`];
          setErrors(newErrors);
          updated[blockIndex].competitions[compIndex][field] = value;
        }
      }
      if (field === "title") updated[blockIndex].competitions[compIndex][field] = value;
      return updated;
    });
  };

  const expandGroupedToSections = (grouped) => {
    // grouped: array of {className, competitions, sections}
    const expanded = [];

    grouped.forEach((g) => {
      const groupName = g.className?.trim();
      if (!groupName) return;

      // find sections that were part of original event
      const origSectionsForGroup = (originalSectionEvents || []).filter((sec) => {
        // sec.className like "Primary - A" - match start with groupName
        return (sec.className || "").startsWith(groupName + " -") || (sec.className || "") === groupName;
      });

      // If original sections exist -> preserve participants where competition name matches
      if (origSectionsForGroup.length > 0) {
        origSectionsForGroup.forEach((sec) => {
          // For each competition in grouped g.competitions, attempt to find matching comp in sec.competitions to preserve participants
          const newComps = (g.competitions || []).map((gc) => {
            const match = (sec.competitions || []).find((sc) => sc.competition === gc.competition);
            return {
              competition: gc.competition,
              title: gc.title || (match && match.title) || "",
              participants: match ? (match.participants || []) : [],
            };
          });
          expanded.push({
            className: sec.className,
            competitions: newComps,
          });
        });
      } else {
        // No original sections in event for this group (new group)
        // use allClasses to find sections for the class group
        const sectionsFromAll = (allClasses || []).filter((c) => c.class_name === groupName);
        if (sectionsFromAll.length > 0) {
          sectionsFromAll.forEach((sec) => {
            expanded.push({
              className: `${sec.class_name} - ${sec.section_name || ""}`.trim(),
              competitions: (g.competitions || []).map((gc) => ({ competition: gc.competition, title: gc.title || "", participants: [] })),
            });
          });
        } else {
          // fallback: keep group as-is (no section info) — server will likely keep it as group or ignore
          expanded.push({
            className: groupName,
            competitions: (g.competitions || []).map((gc) => ({ competition: gc.competition, title: gc.title || "", participants: [] })),
          });
        }
      }
    });

    return expanded;
  };

  // --- Submit handler ---
  const handleSubmit = async () => {
    try {
      // clean teacherCompEvents to flat array
      const teacherCompFlat = teacherCompEvents.flatMap((t) => (t.competitions || []).map((c) => ({ competition: c.competition, title: c.title })));

      // expand grouped classes to section-level preserving participants
      const expandedClassEvents = expandGroupedToSections(classEvents);

      // prepare payload
      const payload = {
        eventBy: selectedEventBy,
        eventName,
        eventDate,
        registerBefore,
        venue,
        description,
        studentCompetitions: tags,
        teacherCompetitions: teacherTags,
        classEvents: expandedClassEvents,
        teacherCompEvents: teacherCompFlat,
      };

      const res = await axios.put(`${URL}/endeavour-events/update/${event._id}`, payload, { headers: { Authorization: token } });
      setResponse({ status: "Success", message: res.data.message || "Event updated" });
      // redirect back after short delay to show toast
      setTimeout(() => navigate("/admin/eventend"), 1500);
    } catch (err) {
      console.error("Update error:", err);
      setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to update event" });
    }
  };

  const handlegoback = () => navigate("/admin/eventend");

  // --- Render ---
  return (
    <>
      <div className="flex justify-start mt-6">
        <FaArrowLeft size={18} onClick={handlegoback} className="cursor-pointer" title="go back" />
      </div>

      <div className="p-3 mx-1 mt-3 bg-white shadow-md rounded-[10px]">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Edit Endeavour Event</h1>
        </div>

        {/* Event basic fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="block mb-1 font-semibold text-gray-800">Event By</label>
              <button type="button" onClick={() => setIsModalOpen(true)} className="block mb-1 font-semibold text-sm text-lavender--600">
                Add Event By
              </button>
            </div>
            <select value={selectedEventBy} onChange={(e) => setSelectedEventBy(e.target.value)} className="border border-gray-300 text-gray-800 rounded-lg block w-full p-2.5">
              <option value="">-- Select Event By --</option>
              {eventBys.map((eb) => <option key={eb._id} value={eb._id}>{eb.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-800">Event Name</label>
            <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Enter Event Name" className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-800">Event Date</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-800">Register Before</label>
            <input type="date" value={registerBefore} onChange={(e) => setRegisterBefore(e.target.value)} className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-800">Event Venue</label>
            <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Enter the venue" className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-800">Event Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter the event description" className="border border-gray-300 rounded-lg block w-full p-2.5" />
          </div>
        </div>

        {/* student competitions tags */}
        <div className="mt-5">
          <label className="block mb-1 font-semibold text-gray-800">Student Competitions</label>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {tags.map((tag, i) => (
              <span key={i} className="flex items-center bg-gray-200 px-2 py-1 rounded-full text-sm">
                {tag} <button className="ml-2 text-gray-600 hover:text-red-500" onClick={() => removeTag(tag)}>✕</button>
              </span>
            ))}
          </div>
          <input type="text" placeholder="+ Add the competitions" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} className="mt-3 border border-gray-300 rounded-lg block w-full p-2.5" />
        </div>

        {/* teacher competition tags */}
        <div className="mt-3">
          <label className="block mb-1 font-semibold text-gray-800">Teacher Competitions</label>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {teacherTags.map((tag, i) => (
              <span key={i} className="flex items-center bg-gray-200 px-2 py-1 rounded-full text-sm">
                {tag} <button className="ml-2 text-gray-600 hover:text-red-500" onClick={() => removeTeacherTag(tag)}>✕</button>
              </span>
            ))}
          </div>
          <input type="text" placeholder="+ Add the competitions" value={teacherInput} onChange={(e) => setTeacherInput(e.target.value)} onKeyDown={handleTeacherKeyDown} className="mt-3 border border-gray-300 rounded-lg block w-full p-2.5" />
        </div>

        {/* Add group / teacher blocks */}
        <div className="flex justify-end mt-6 gap-3">
          <button onClick={addClassEvent} className="px-5 py-2 bg-lavender--600 text-white rounded-lg">Add Event for Class (Group)</button>
          <button onClick={addTeacherCompBlock} className="px-5 py-2 bg-lavender--600 text-white rounded-lg">Add Teacher Competition Block</button>
        </div>

        {/* Grouped class events (should show only groups like Primary, Junior, Secondary) */}
        <div className="mt-4 space-y-6">
          {classEvents.map((group, groupIndex) => (
            <div key={groupIndex} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block mb-1 font-semibold text-gray-800">Select Class Group</label>
                  <select value={group.className} onChange={(e) => handleChange(groupIndex, 0, "className", e.target.value)} className={`border border-gray-300 rounded-lg block w-full p-2.5 ${errors[`class-${groupIndex}`] ? "border-red-500" : ""}`}>
                    <option value="">-- Select Class Group --</option>
                    {classGroups.map((cg, idx) => <option key={idx} value={cg}>{cg}</option>)}
                  </select>
                  {errors[`class-${groupIndex}`] && <p className="text-red-500 text-sm mt-1">{errors[`class-${groupIndex}`]}</p>}
                  {/* show how many sections exist (from original event) */}
                  <p className="text-xs text-gray-500 mt-1">{(group.sections || []).length ? `${group.sections.length} section(s) in this event` : `No sections included yet`}</p>
                </div>
              </div>

              {/* Group competitions list */}
              <div className="mt-3 space-y-3">
                {group.competitions.map((comp, compIndex) => {
                  const isLast = compIndex === group.competitions.length - 1;
                  const filled = (comp.competition || "").trim() && (comp.title || "").trim();
                  return (
                    <div key={compIndex} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                      <div></div>
                      <div>
                        <label className="block mb-1 text-gray-800 font-semibold">Select Competition</label>
                        <select value={comp.competition} onChange={(e) => handleChange(groupIndex, compIndex, "competition", e.target.value)} className={`border border-gray-300 rounded-lg block w-full p-2.5 ${errors[`comp-${groupIndex}-${compIndex}`] ? "border-red-500" : ""}`}>
                          <option value="">-- Select Competition --</option>
                          {tags.map((t, i) => <option key={i} value={t}>{t}</option>)}
                        </select>
                        {errors[`comp-${groupIndex}-${compIndex}`] && <p className="text-red-500 text-sm mt-1">{errors[`comp-${groupIndex}-${compIndex}`]}</p>}
                      </div>

                      <div>
                        <label className="block mb-1 text-gray-800 font-semibold">Enter Title</label>
                        <input type="text" value={comp.title} onChange={(e) => handleChange(groupIndex, compIndex, "title", e.target.value)} placeholder="Enter title" className="border border-gray-300 rounded-lg block w-full p-2.5" />
                      </div>

                      <div className="flex justify-end">
                        {isLast ? (
                          <button onClick={() => addCompetitionRow(groupIndex)} disabled={!filled} className={`px-4 py-2 rounded-lg text-white ${filled ? "bg-lavender--600" : "bg-lavender--600 opacity-50 cursor-not-allowed"}`}>
                            <FaPlus title="Add" />
                          </button>
                        ) : (
                          <button onClick={() => deleteCompetitionRow(groupIndex, compIndex)} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                            <FaTrash title="Delete" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Teacher competition blocks (unchanged UI) */}
        <div className="mt-4 space-y-6">
          {teacherCompEvents.map((block, blockIndex) => (
            <div key={blockIndex} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-gray-800">Teacher Competitions</h3>
                <button type="button" onClick={() => deleteTeacherCompBlock(blockIndex)} className="text-sm text-red-500">Remove</button>
              </div>

              <div className="space-y-3">
                {block.competitions.map((comp, compIndex) => {
                  const isLast = compIndex === block.competitions.length - 1;
                  const filled = comp.competition.trim() && comp.title.trim();
                  return (
                    <div key={compIndex} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="block mb-1 text-gray-800 font-semibold">Select Competition</label>
                        <select value={comp.competition} onChange={(e) => handleTeacherCompChange(blockIndex, compIndex, "competition", e.target.value)} className={`border border-gray-300 rounded-lg block w-full p-2.5 ${errors[`teacher-comp-${blockIndex}-${compIndex}`] ? "border-red-500" : ""}`}>
                          <option value="">-- Select Competition --</option>
                          {teacherTags.map((t, i) => <option key={i} value={t}>{t}</option>)}
                        </select>
                        {errors[`teacher-comp-${blockIndex}-${compIndex}`] && <p className="text-red-500 text-sm mt-1">{errors[`teacher-comp-${blockIndex}-${compIndex}`]}</p>}
                      </div>

                      <div>
                        <label className="block mb-1 text-gray-800 font-semibold">Enter Title</label>
                        <input type="text" value={comp.title} onChange={(e) => handleTeacherCompChange(blockIndex, compIndex, "title", e.target.value)} className="border border-gray-300 rounded-lg block w-full p-2.5" />
                      </div>

                      <div className="flex justify-end">
                        {isLast ? (
                          <button onClick={() => addTeacherCompetitionRow(blockIndex)} disabled={!filled} className={`px-4 py-2 rounded-lg text-white ${filled ? "bg-lavender--600" : "bg-lavender--600 opacity-50 cursor-not-allowed"}`}>
                            <FaPlus title="Add" />
                          </button>
                        ) : (
                          <button onClick={() => deleteTeacherCompetitionRow(blockIndex, compIndex)} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                            <FaTrash title="Delete" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Add Event By modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center w-full h-full">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                <h2 className="text-lg font-semibold mb-3 text-gray-800">Add Event By</h2>
                <input type="text" placeholder="Enter event by name" value={newEventBy} onChange={(e) => setNewEventBy(e.target.value)} className="border border-gray-300 rounded-lg block w-full p-2.5 mb-4" />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button onClick={async () => {
                    if (!newEventBy.trim()) return;
                    try {
                      const res = await axios.post(`${URL}/endeavour-events/eventby`, { name: newEventBy }, { headers: { Authorization: token } });
                      setEventBys((p) => [...p, res.data.eventBy]);
                      setNewEventBy("");
                      setIsModalOpen(false);
                      setResponse({ status: "Success", message: "Event By added successfully!" });
                    } catch (err) {
                      console.error(err);
                      setResponse({ status: "Failed", message: err.response?.data?.message || "Failed to add Event By" });
                    }
                  }} className="px-4 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700">Save</button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button onClick={handleSubmit} className="px-6 py-2 bg-lavender--600 text-white rounded-lg hover:bg-lavender--700">Update Event</button>
        </div>
      </div>

      {Response.status && (Response.status === "Success" ? <SuccessMessage Message={Response.message} /> : <FailedMessage Message={Response.message} />)}
    </>
  );
};
