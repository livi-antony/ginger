// Fake nested data — mirrors the eventual database shape.
// Each level can hold children + its own tasks.
export const areas = [
  {
    id: 'a1',
    name: 'Study',
    tasks: [
      { id: 't1', name: 'Email tutor about extension', done: false },
      { id: 't2', name: 'Renew library books', done: false },
    ],
    sections: [
      {
        id: 's1',
        name: 'Semester 2',
        tasks: [
          { id: 't3', name: 'Plan study timetable', done: false },
        ],
        subsections: [
          {
            id: 'ss1',
            name: 'Biology 201',
            tasks: [
              { id: 't4', name: 'Assignment A1', done: false },
              { id: 't5', name: 'Read chapter 4', done: false },
            ],
          },
          {
            id: 'ss2',
            name: 'Chemistry 110',
            tasks: [
              { id: 't6', name: 'Lab report', done: false },
            ],
          },
        ],
      },
      {
        id: 's2',
        name: 'Semester 1',
        tasks: [],
        subsections: [],
      },
    ],
  },
  {
    id: 'a2',
    name: 'Tennis',
    tasks: [
      { id: 't7', name: 'Book court for Saturday', done: false },
    ],
    sections: [],
  },
  {
    id: 'a3',
    name: 'Everyday Life',
    tasks: [
      { id: 't8', name: 'Grocery shop', done: false },
    ],
    sections: [],
  },
];