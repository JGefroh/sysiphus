<?php
  $disk_free_in_bytes = disk_free_space("./");
  $disk_total_in_bytes = disk_total_space("./");
  $disk_used_in_bytes = $disk_total_in_bytes - $disk_free_in_bytes;
  echo "{";
  echo "\"sysiphus-status\": true,";
  echo "\"disk_used_in_bytes\": {$disk_used_in_bytes},";
  echo "\"disk_free_in_bytes\": {$disk_free_in_bytes},";
  echo "\"disk_total_in_bytes\": {$disk_total_in_bytes}";
  echo "}";
?>
