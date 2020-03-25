import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import {
  MatButtonModule, MatCardModule, MatDialogModule, MatInputModule, MatTableModule,
  MatToolbarModule, MatMenuModule,MatIconModule, MatProgressSpinnerModule, MatCheckboxModule, MatProgressBarModule, MatFormFieldModule,
  MatTooltipModule
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
  MatProgressSpinnerModule,
  MatCheckboxModule,
  MatProgressBarModule,
  MatFormFieldModule,
  MaterialFileInputModule,
  MatTooltipModule
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
   MatProgressSpinnerModule,
   MatCheckboxModule,
   MatProgressBarModule,
   MatFormFieldModule,
   MaterialFileInputModule,
   MatTooltipModule
   ],
})
export class CustomMaterialModule { }
