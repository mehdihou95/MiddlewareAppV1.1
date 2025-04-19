16/04
Today, I have been working most of time to fix the error handling for the Processed files, Files concerned @AsnDocumentProcessingStrategy.java @ProcessedFileServiceImpl.java @XmlProcessorServiceImpl.java, BUG FIXED

Else I have restructured the ASN_HEADERS table with all the necessary Fields check @ASN HEADERS STRUCTURE.csv, Guide @ASN_MAPPING_GUIDE.md 

Commited to github

Tomorrow I'm Planning To start testing the listner connector (Will start with SFTP) and restructure the ASN_LINES table

17/04

While trying to modify a field's name for ASN_HEDEARS I have learned that it should be done in : @BaseEntity.java (If Id); @AsnHeader.java (as well as @AsnLine.java if it's a key that's used there too); @AsnHeaderRepository.java (@AsnLineRepository.java); @AsnServiceImpl.java then @V0__Create_Base_Tables.sql 



-------------------------------------------------------------------------------------------
run in the background : cd backend/processor; mvn spring-boot:run
run in the background : cd frontend; npm start

@AsnHeader.java @AsnServiceImpl.java @AsnDocumentProcessingStrategy.java @AsnHeaderRepository.java @AsnService.java 

ASN Strategy : 
Any field mapping error (like the region_id type mismatch) will mark the file as ERROR
All mapping errors are collected and included in the error message
The dynamic mapping functionality remains intact
Error messages are properly truncated to fit the database column
Both header and line mapping errors are tracked
The process continues to try to map all fields to capture all potential errors
---------------------------------------------------------------------------------------------

