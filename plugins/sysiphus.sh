HOST=$1
PROJECT=$2
if [ -z "${HOST}" ]; then
  echo 'A Sysiphus host must be provided when running the script. eg.\n\t./sysiphus.sh http://sysiphus.example.com 1234'
  exit -1;
elif [ -z "${PROJECT}" ]; then
  echo 'A project id must be provided when running the script. eg.\n\t./sysiphus.sh http://sysiphus.example.com 1234'
  exit -1;
fi
started() { echo "Sending sysiphus update to: $HOST"; }

if [ "$(uname)" == "Darwin" ]; then
    # Do something under Mac OS X platform
    get_cpu_idle() { top -l 5 | head -n 4 | tail -1 | awk '{ print $7}' | sed 's/%//'; }
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
    # Do something under GNU/Linux platform
    get_cpu_idle() {  top -b -n1 | grep "Cpu(s)" | awk '{ print $8 }'; }
else
    get_cpu_idle() { echo '-1'; }
fi

get_disk_free_in_bytes() { df --block-size=512 -P . | tail -1  | awk '{print $4 * 512}'; }
get_disk_used_in_bytes() { df --block-size=512 -P . | tail -1 | awk '{print $3 * 512}'; }
waiting(){
  echo $HOST
}
contact()
{
  curl -H "Content-Type: application/json" -X POST -d "{\"id\": $PROJECT, \"disk_used_in_bytes\": $1, \"disk_free_in_bytes\": $2, \"cpu_idle\": $3}" $HOST/api/performance_update
}

started
DISK_USED_IN_BYTES=$(get_disk_used_in_bytes)
DISK_FREE_IN_BYTES=$(get_disk_free_in_bytes)
CPU_IDLE=$(get_cpu_idle)
contact $DISK_USED_IN_BYTES $DISK_FREE_IN_BYTES $CPU_IDLE
