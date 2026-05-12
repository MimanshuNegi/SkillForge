package com.edutech.entity;


import java.time.LocalDateTime;

import javax.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

public class Proposal {

   //write your logic here
   Long id;

   Double bidAmount;

   String status;

   Job job;

   User freelancer;

   LocalDateTime appliedAt;
}
