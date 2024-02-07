create db users-tests;

use users-tests;

create table users (
    id int(10) unsigned not null, auto_increment,
    name varchar(20) not null,
    username varchar(20) not null,
    password_hash varchar(256) not null,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    deleted_at timestamp null default null,
    primary key (id)
);

create table tests (
    id int(10) unsigned not null, auto_increment,
    user_id int(10) unsigned not null,
    description varchar(100) not null,
    answer varchar(10) not null,
    status tinyint(4) unsigned not null default 0,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp on update current_timestamp,
    deleted_at timestamp null default null,
    primary key (id),
    key fk_test_user (user_id),
    constraint fk_test_user foreign key (user_id) references users (id)
);