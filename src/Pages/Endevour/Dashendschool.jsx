import React from 'react'
import './DashSundayschool.css'
import { FaPlus } from "react-icons/fa";

export const Dashendschool = () => {
    return (
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <div className="gap-for-cards">
                        <div className="dash-info" >
                            <div className="dash-value">
                                50
                            </div>
                            <div className="dash-label">Total Students</div>
                        </div>
                        <div className="dash-info" >
                            <div className=" dash-value">
                                60
                            </div>
                            <div className="dash-label">Total Class</div>
                        </div>
                        <div className="dash-info" >
                            <div className=" dash-value">
                                15
                            </div>
                            <div className="dash-label">Events This Month</div>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <div className="gap-for-cards">
                        <div className="dash-info" >
                            <div className=" dash-value">
                                100000
                            </div>
                            <div className="dash-label">This Week Offering</div>
                        </div>
                        <div className="dash-info" >
                            <div className=" dash-value">
                                5
                            </div>
                            <div className="dash-label">Recent Bids</div>
                        </div>
                        <div className="dash-info" >
                            <div className=" dash-value">
                                10
                            </div>
                            <div className="dash-label">Teachers</div>
                        </div>
                    </div>
                </div>

                <div className="col-sm-7">
                    <div className="announcement">
                        <div className="dash-info-announce" >
                            <p className='head-ancmnt text-lavender--600'>Announcements</p>
                            <div className="notices">
                                Compete With Faith
                            </div>
                            <div className="notices">
                                Talent For Christ
                            </div>
                            <div className="notices">
                                Play, Pray, Win
                            </div>
                            <div className="notices">
                                Faith-Filled Fun
                            </div>
                            <div className="notices">
                                Run For Glory
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-sm-5">
                    <div className="announcement">
                        <div className="dash-info-announce" >
                            <p className='head-ancmnt text-lavender--600'>Quick Links</p>
                            <button className='quicklinks'><FaPlus />Add Student</button>
                            <button className='quicklinks'><FaPlus />Create Event</button>
                            <button className='quicklinks'><FaPlus />Add Class</button>
                            <button className='quicklinks'><FaPlus />Add Teacher</button>
                            <button className='quicklinks'><FaPlus />Add Offering</button>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}
