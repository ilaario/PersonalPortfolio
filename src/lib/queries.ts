export const projectsQuery = `
  *[_type == "project"] | order(order asc) {
    _id,
    title,
    subtitle,
    description,
    tech,
    url,
    repo
  }
`

export const timelineQuery = `
  *[_type == "timelineItem"] 
  | order(coalesce(order, 9999) asc, startDate desc) {
    _id,
    title,
    subtitle,
    organisation,
    location,
    kind,
    startDate,
    endDate,
    isCurrent,
    description
  }
`