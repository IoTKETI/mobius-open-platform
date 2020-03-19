import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule, MatCardModule, MatDialogModule, MatInputModule, MatTableModule,
  MatToolbarModule, MatMenuModule, MatIconModule, MatCheckboxModule, MatSlideToggleModule, MatRadioModule, MatFormFieldModule, MatTabsModule
} from '@angular/material';
@NgModule({
  imports: [
  CommonModule, 
  MatToolbarModule,
  MatButtonModule, 
  MatCardModule,
  MatInputModule,
  MatDialogModule,
  MatTableModule,
  MatMenuModule,
  MatIconModule,
  MatCheckboxModule,
  MatSlideToggleModule,
  MatRadioModule,
  MatFormFieldModule,
  MatTabsModule,
  ],
  exports: [
  CommonModule,
   MatToolbarModule, 
   MatButtonModule, 
   MatCardModule, 
   MatInputModule, 
   MatDialogModule, 
   MatTableModule, 
   MatMenuModule,
   MatIconModule,
   MatCheckboxModule,
   MatSlideToggleModule,
   MatRadioModule,
   MatFormFieldModule,
   MatTabsModule,
   ],
})
export class CustomMaterialModule { }
