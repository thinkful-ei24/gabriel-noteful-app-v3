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
    ],
    userId: '000000000000000000000001'
  },
  {
    _id: '000000000000000000000001',
    title: 'I SHOULDNT BE ABLE TO SEE THIS',
    content:
      'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.',
    folderId: '111111111111111111111101',
    tags: [
      '222222222222222222222200',
      '222222222222222222222201',
      '222222222222222222222202'
    ],
    userId: '000000000000000000000002'
  }
];

const folders = [
  {
    _id: '111111111111111111111100',
    name: 'Archive',
    userId: '000000000000000000000001'
  },
  {
    _id: '111111111111111111111101',
    name: 'Drafts',
    userId: '000000000000000000000001'
  },
  {
    _id: '111111111111111111111102',
    name: 'Personal',
    userId: '000000000000000000000002'
  },
  {
    _id: '111111111111111111111103',
    name: 'Work',
    userId: '000000000000000000000002'
  }
];

const tags = [
  {
    _id: '222222222222222222222200',
    name: 'foo',
    userId: '000000000000000000000001'
  },
  {
    _id: '222222222222222222222201',
    name: 'bar',
    userId: '000000000000000000000001'
  },
  {
    _id: '222222222222222222222202',
    name: 'baz',
    userId: '000000000000000000000002'
  },
  {
    _id: '222222222222222222222203',
    name: 'qux',
    userId: '000000000000000000000002'
  }
];

const users = [
  {
    _id: '000000000000000000000001',
    fullname: 'Bob User',
    username: 'bobuser',
    // hash digest for the string 'password'
    password: '$2a$10$QJCIX42iD5QMxLRgHHBJre2rH6c6nI24UysmSYtkmeFv6X8uS1kgi'
  },
  {
    _id: '000000000000000000000002',
    fullname: 'Bob User',
    username: 'tomato',
    // hash digest for the string 'password'
    password: '$2a$10$QJCIX42iD5QMxLRgHHBJre2rH6c6nI24UysmSYtkmeFv6X8uS1kgi'
  }
];

module.exports = { notes, folders, tags, users };
