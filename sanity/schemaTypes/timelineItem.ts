import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'timelineItem',
  title: 'Timeline',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description: 'Role, program, or position',
    }),
    defineField({
      name: 'organisation',
      title: 'Organisation',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Work', value: 'work' },
          { title: 'Education', value: 'education' },
          { title: 'Award', value: 'award' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
        name: 'startMonth',
        title: 'Start (YYYY-MM)',
        type: 'string',
        validation: (Rule) =>
          Rule.required()
            .regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
              name: 'YYYY-MM',
              invert: false,
            })
            .error('Use format YYYY-MM (e.g., 2024-01)'),
      }),
      defineField({
        name: 'endMonth',
        title: 'End (YYYY-MM)',
        type: 'string',
        validation: (Rule) =>
          Rule.regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
            name: 'YYYY-MM',
            invert: false,
          }).error('Use format YYYY-MM (e.g., 2024-01)'),
      }),
    defineField({
      name: 'isCurrent',
      title: 'Current',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
        name: 'description',
        title: 'Description',
        type: 'array',
        of: [
          {
            type: 'block',
            // opzionale: puoi personalizzare gli stili disponibili
            styles: [
              { title: 'Normal', value: 'normal' },
              { title: 'Heading 2', value: 'h2' },
              { title: 'Heading 3', value: 'h3' },
              { title: 'Quote', value: 'blockquote' },
            ],
            // opzionale: marks tipo bold, italic, link
            marks: {
              decorators: [
                { title: 'Bold', value: 'strong' },
                { title: 'Italic', value: 'em' },
              ],
              annotations: [
                {
                  name: 'link',
                  type: 'object',
                  title: 'Link',
                  fields: [
                    {
                      name: 'href',
                      type: 'url',
                      title: 'URL',
                    },
                  ],
                },
              ],
            },
          },
        ],
      }),
    defineField({
      name: 'order',
      title: 'Order override',
      type: 'number',
      description: 'Optional. Lower = higher up in the list.',
    }),
  ],
})