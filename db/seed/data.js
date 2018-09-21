const notes = [
  {
    _id: '000000000000000000000000',
    title: '7 things lady gaga has in common with cats',
    content:
      'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
    folderId: '111111111111111111111101',
    tags: [
      '222222222222222222222200',
      '222222222222222222222201',
      '222222222222222222222202'
    ]
  },
  {
    _id: '000000000000000000000001',
    title: '7 things lady gaga has in common with cats',
    content:
      'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
    folderId: '111111111111111111111101',
    tags: [
      '222222222222222222222200',
      '222222222222222222222201',
      '222222222222222222222202'
    ]
  }
];

const folders = [
  {
    _id: '111111111111111111111100',
    name: 'Archive'
  },
  {
    _id: '111111111111111111111101',
    name: 'Drafts'
  },
  {
    _id: '111111111111111111111102',
    name: 'Personal'
  },
  {
    _id: '111111111111111111111103',
    name: 'Work'
  }
];

const tags = [
  {
    _id: '222222222222222222222200',
    name: 'foo'
  },
  {
    _id: '222222222222222222222201',
    name: 'bar'
  },
  {
    _id: '222222222222222222222202',
    name: 'baz'
  },
  {
    _id: '222222222222222222222203',
    name: 'qux'
  }
];

module.exports = { notes, folders, tags };
