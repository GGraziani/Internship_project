USE test_moresi;

DROP TABLE IF EXISTS users;
CREATE TABLE users
(
  uid               int unsigned NOT NULL auto_increment,	# Unique ID for the record
  username			varchar(30) NOT NULL,					# Username
  password          char(60) NOT NULL,						# password
  email				varchar(255) NOT NULL,					# user email	
  company			varchar(20) NOT NULL,					# user company	
  price             decimal(5,4) NOT NULL,					# price per kW/10min

  PRIMARY KEY     (uid)
);

DROP TABLE IF EXISTS admins;
CREATE TABLE admins
(
  uid               int unsigned NOT NULL auto_increment,	# Unique ID for the record
  username			varchar(15) NOT NULL,					# Username
  password          char(60) NOT NULL,						# password
  email				varchar(255) NOT NULL,					# admin email	
  permissions		varchar(1) NOT NULL,					# admin permissions	

  PRIMARY KEY     (uid)
);

INSERT INTO users ( username, password, email, company, price )
  VALUES ( "Rossi Marco", "$2a$08$3uIpgIUB2rZZ1zMDabGyF./gfA38dc69cBc7lE8ioS0nS1bHmmAj6", "rossimarco@gmail.com" , "Colt", 0.0500),
		 ( "Graziani Gustavo", "$2a$08$0xqIJddPvPjzeAGOYC4J7uq8BnbqCzSj12nlHrYKyxJ9rwUIL810K", "grazianigustavo@gmail.com" , "Beitsa", 0.0400),
  		 ( "Fantini Alessandro", "$2a$08$FViEKaru7bGQsWfaPw4biu4K9q41GRaLOxW1cJh881jCAt2RQNVQe", "fantinialessandro@gmail.com" , "Swissvoip", 0.0400), 
  		 ( "test", "$2a$08$PnAO/WkJdSka/1EMS73kKOGnn/rYrNFpmbgKTu1sJe5as8fAxz45i", "test@gmail.com" , "Moresi", 0.0500);
  
INSERT INTO admins ( username, password, email, permissions )
  VALUES ( "Master", "$2a$08$xsISPhOWLXRdA1BzFJzRgOe6GjdNRBQHk3cw7klpwQ05uCXpjyRw6", "master@gmail.com" , "A"),
  		 ( "Admin", "$2a$08$HGR1i.WKsY6Xj4pCpWMMSeAdPrLQIzTuxhfNrk6VTesj07q60yMji", "admin@gmail.com" , "B");
  
 
ALTER TABLE pdu ADD uid int(10) unsigned;
UPDATE pdu SET uid=1 WHERE hostname='Pdu_Colt_sotto';
UPDATE pdu SET uid=1 WHERE hostname='Pdu_Colt_sopra';
UPDATE pdu SET uid=2 WHERE hostname='Pdu_Beitsa_up';
UPDATE pdu SET uid=2 WHERE id=11;
UPDATE pdu SET uid=3 WHERE id=34;
UPDATE pdu SET uid=3 WHERE id=37;
UPDATE pdu SET uid=4 WHERE id=31;
UPDATE pdu SET uid=4 WHERE id=20;