running() { echo 'Sysiphus is watching...'; }
get_disk_free_in_bytes() { df -P . | tail -1  | awk '{print $4}'; }
get_disk_used_in_bytes() { df -P . | tail -1 | awk '{print $3}'; }
waiting(){
  echo '.'
  echo '.'
}
contact()
{
  curl -H "Content-Type: application/json" -X POST -d "{\"disk_used_in_bytes\": $1, \"disk_free_in_bytes\": $2}" localhost:8080/api/performance_update
}

running

waiting &

WAITING_SCRIPT=$1
DISK_USED_IN_BYTES=$(get_disk_used_in_bytes)
DISK_FREE_IN_BYTES=$(get_disk_free_in_bytes)

contact $DISK_USED_IN_BYTES $DISK_FREE_IN_BYTES

kill $WAITING_SCRIPT >/dev/null 2>&1
