import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_LINUXDISK_1 = `# ── Block device tree ───────────────────────────────────────
lsblk                         # Tree view of all block devices
lsblk -f                      # Include filesystem type and UUID
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT,UUID   # Custom columns

# ── Partition tables ─────────────────────────────────────────
sudo fdisk -l                 # List all partition tables (MBR/GPT)
sudo fdisk -l /dev/sdb        # Specific disk
sudo parted /dev/sdb print    # parted output (better for GPT)

# ── Filesystem usage ─────────────────────────────────────────
df -h                         # Filesystem space usage (human-readable)
df -hT                        # Include filesystem type
df -ih                        # Inode usage (critical for /tmp issues)

# ── Disk I/O performance ─────────────────────────────────────
iostat -x 2 5                 # Extended I/O stats, 2s intervals, 5 times
iotop                         # Real-time I/O usage by process (like top)
sudo hdparm -tT /dev/sda      # Read speed test

# ── Disk health (SMART) ──────────────────────────────────────
sudo apt install smartmontools
sudo smartctl -a /dev/sda     # Full SMART health report
sudo smartctl -H /dev/sda     # Quick health check`
const CODE_LINUXDISK_2 = `# ═══ STEP 1: Create partition ════════════════════════════════
sudo fdisk /dev/sdb   # Interactive partitioner
# Key fdisk commands:
#   n  → new partition
#   p  → primary (vs extended)
#   1  → partition number
#   (enter) → accept default first sector
#   +10G → size (or enter for rest of disk)
#   t  → change type (82=swap, 83=Linux, 8e=LVM)
#   w  → write changes and exit

# Inform kernel of partition table change
sudo partprobe /dev/sdb
lsblk /dev/sdb     # Verify partition appears


# ═══ STEP 2: Create filesystem ════════════════════════════════
sudo mkfs.ext4 -L "datastore" /dev/sdb1    # ext4 with label
sudo mkfs.xfs  -L "faststore" /dev/sdb2    # XFS (preferred for large files)

# Get UUID for fstab (UUIDs survive device renames)
sudo blkid /dev/sdb1


# ═══ STEP 3: Mount temporarily ════════════════════════════════
sudo mkdir -p /mnt/datastore
sudo mount /dev/sdb1 /mnt/datastore
df -h /mnt/datastore     # Verify mounted


# ═══ STEP 4: Make mount permanent (add to /etc/fstab) ═════════
# Get UUID
UUID=$(sudo blkid -s UUID -o value /dev/sdb1)
echo "UUID=$UUID /mnt/datastore ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab

# Test fstab BEFORE rebooting (critical step!)
sudo umount /mnt/datastore
sudo mount -a             # Mounts everything in fstab
df -h /mnt/datastore      # Confirm still works`
const CODE_LINUXDISK_3 = `# ═══ STEP 1: Initialise physical volumes ═════════════════════
sudo pvcreate /dev/sdb /dev/sdc    # Initialise two disks as PVs
sudo pvs                            # List PVs with sizes
sudo pvdisplay /dev/sdb             # Detailed PV info


# ═══ STEP 2: Create volume group ═════════════════════════════
sudo vgcreate vgdata /dev/sdb /dev/sdc    # Create VG spanning two disks
sudo vgs                                    # List VGs
sudo vgdisplay vgdata                       # Detailed VG info (free extents)


# ═══ STEP 3: Create logical volumes ══════════════════════════
sudo lvcreate -L 20G -n lvapp  vgdata    # Fixed size: 20GB volume
sudo lvcreate -L 10G -n lvlogs vgdata    # Another 10GB volume
sudo lvcreate -l 100%FREE -n lvbackup vgdata  # Use ALL remaining space

sudo lvs                              # List all LVs
sudo lvdisplay /dev/vgdata/lvapp      # Detailed info


# ═══ STEP 4: Format and mount ════════════════════════════════
sudo mkfs.ext4 /dev/vgdata/lvapp
sudo mkfs.xfs  /dev/vgdata/lvlogs

sudo mkdir -p /app /var/log/app
sudo mount /dev/vgdata/lvapp  /app
sudo mount /dev/vgdata/lvlogs /var/log/app


# ═══ STEP 5: Add to fstab for persistence ════════════════════
echo "/dev/vgdata/lvapp  /app         ext4  defaults  0 2" | sudo tee -a /etc/fstab
echo "/dev/vgdata/lvlogs /var/log/app xfs   defaults  0 2" | sudo tee -a /etc/fstab`
const CODE_LINUXDISK_4 = `# Add a new physical disk to an existing VG
sudo pvcreate /dev/sdd
sudo vgextend vgdata /dev/sdd     # VG now has more free space
sudo vgs                           # Confirm new free space

# Extend the LV + filesystem in one command (-r = resize filesystem too)
sudo lvextend -r -L +20G /dev/vgdata/lvapp      # Add exactly 20GB
sudo lvextend -r -l +100%FREE /dev/vgdata/lvapp  # Use ALL remaining free space

# Verify
df -h /app          # Filesystem should show increased size immediately
sudo lvs            # LV should show new size`
const CODE_LINUXDISK_5 = `lsblk
sudo fdisk -l /dev/sdb
sudo fdisk -l /dev/sdc`
const CODE_LINUXDISK_6 = `NAME   MAJ:MIN  SIZE  TYPE  MOUNTPOINT
sda      8:0     40G   disk
├─sda1   8:1      1G   part  /boot
└─sda2   8:2     39G   part
  └─ubuntu--vg-ubuntu--lv  253:0  20G lvm  /
sdb      8:16    10G   disk             ← new disk 1
sdc      8:32    10G   disk             ← new disk 2`
const CODE_LINUXDISK_7 = `sudo apt install lvm2 -y

# Initialise PVs (no partitioning needed — use whole disk)
sudo pvcreate /dev/sdb /dev/sdc

# Verify
sudo pvs`
const CODE_LINUXDISK_8 = `  PV         VG     Fmt  Attr PSize  PFree
  /dev/sdb          lvm2 ---  10.00g 10.00g
  /dev/sdc          lvm2 ---  10.00g 10.00g`
const CODE_LINUXDISK_9 = `# Create VG
sudo vgcreate vglab /dev/sdb /dev/sdc
sudo vgs   # Should show 20GB total

# Create two LVs: 8GB for data, 5GB for logs
sudo lvcreate -L 8G  -n lvdata vglab
sudo lvcreate -L 5G  -n lvlogs vglab
sudo lvs`
const CODE_LINUXDISK_10 = `  VG    #PV #LV #SN Attr  VSize   VFree
  vglab   2   2   0 wz--n- 19.99g 6.99g

  LV     VG    Attr       LSize
  lvdata vglab -wi-a----- 8.00g
  lvlogs vglab -wi-a----- 5.00g`
const CODE_LINUXDISK_11 = `sudo mkfs.ext4 -L "labdata" /dev/vglab/lvdata
sudo mkfs.xfs  -L "lablogs" /dev/vglab/lvlogs

sudo mkdir -p /mnt/labdata /mnt/lablogs
sudo mount /dev/vglab/lvdata /mnt/labdata
sudo mount /dev/vglab/lvlogs /mnt/lablogs

# Add to fstab
echo "/dev/vglab/lvdata /mnt/labdata ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab
echo "/dev/vglab/lvlogs /mnt/lablogs xfs  defaults,nofail 0 2" | sudo tee -a /etc/fstab

# Test fstab
sudo umount /mnt/labdata /mnt/lablogs
sudo mount -a
df -h /mnt/labdata /mnt/lablogs`
const CODE_LINUXDISK_12 = `Filesystem                  Size  Used Avail Use% Mounted on
/dev/mapper/vglab-lvdata    7.9G   24M  7.4G   1% /mnt/labdata
/dev/mapper/vglab-lvlogs    5.0G   68M  5.0G   2% /mnt/lablogs`
const CODE_LINUXDISK_13 = `# Extend LV + filesystem in one step (-r flag)
sudo lvextend -r -L +3G /dev/vglab/lvdata

# Verify — filesystem should immediately show new size
df -h /mnt/labdata
sudo lvs`
const CODE_LINUXDISK_14 = `Filesystem                  Size  Used Avail Use% Mounted on
/dev/mapper/vglab-lvdata     11G   24M   10G   1% /mnt/labdata  ← now 11GB!

  LV     VG    Attr       LSize
  lvdata vglab -wi-ao---- 11.00g  ← extended successfully`
const CODE_LINUXDISK_15 = `# ── Inspection ──────────────────────────────────────────────
lsblk -f                          # Block device tree + filesystems
sudo fdisk -l                     # All partition tables
df -hT                            # Filesystem usage + type
sudo blkid                        # UUIDs + filesystem types
sudo pvs && sudo vgs && sudo lvs  # LVM summary

# ── Partition + Format ───────────────────────────────────────
sudo fdisk /dev/sdb               # Interactive MBR partitioner
sudo parted /dev/sdb              # parted (better for GPT/large disks)
sudo mkfs.ext4 -L "label" /dev/sdb1
sudo mkfs.xfs  -L "label" /dev/sdb1
sudo mkswap /dev/sdb2 && sudo swapon /dev/sdb2

# ── Mount ────────────────────────────────────────────────────
sudo mount /dev/sdb1 /mnt/data
sudo mount -a                     # Mount everything in fstab
sudo umount /mnt/data
sudo blkid -s UUID -o value /dev/sdb1   # Get UUID for fstab

# ── LVM Lifecycle ────────────────────────────────────────────
sudo pvcreate /dev/sdb
sudo vgcreate myvg /dev/sdb
sudo lvcreate -L 10G -n mylv myvg
sudo lvextend -r -L +5G /dev/myvg/mylv  # Extend + resize fs
sudo lvreduce -r -L 5G  /dev/myvg/mylv  # Shrink (careful!)
sudo lvremove /dev/myvg/mylv
sudo vgremove myvg
sudo pvremove /dev/sdb

# ── Snapshots ────────────────────────────────────────────────
sudo lvcreate -L 2G -s -n mysnap /dev/myvg/mylv   # Create snapshot
sudo mount /dev/myvg/mysnap /mnt/snapshot          # Mount snapshot
sudo lvconvert --merge /dev/myvg/mysnap            # Revert to snapshot`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the correct sequence for creating a new filesystem on a disk partition?',
    options: [
      'mkfs → fdisk → mount',
      'fdisk (create partition) → mkfs (format) → mount (attach)',
      'mount → mkfs → fdisk',
      'fdisk → mount → mkfs',
    ],
    correct: 1,
    explanation: 'The sequence is always: (1) fdisk/parted to create the partition on the disk, (2) mkfs to create a filesystem (ext4, xfs, etc.) on the partition, (3) mount to attach it to the directory tree. Optionally, add to /etc/fstab for persistence at boot. Trying to mount before formatting results in an error.',
  },
  {
    id: 'q2',
    question: 'What are the three layers in LVM, from bottom to top?',
    options: [
      'Disk → Partition → Volume',
      'Physical Volume (PV) → Volume Group (VG) → Logical Volume (LV)',
      'Block Device → Stripe → Logical Unit',
      'Physical Disk → Logical Group → Extended Volume',
    ],
    correct: 1,
    explanation: 'LVM has three layers: Physical Volumes (PV) are the actual block devices or partitions initialised for LVM use. Volume Groups (VG) pool one or more PVs into a storage pool. Logical Volumes (LV) are carved out of a VG and used like regular partitions. This abstraction allows resizing, snapshotting, and migration without downtime.',
  },
  {
    id: 'q3',
    question: 'Which command extends an existing LVM logical volume AND the filesystem on it in one step?',
    options: [
      'lvextend -L +10G /dev/vgdata/lvdata && resize2fs /dev/vgdata/lvdata',
      'lvextend -r -L +10G /dev/vgdata/lvdata',
      'lvresize --resizefs +10G /dev/vgdata/lvdata',
      'Both B and C are correct',
    ],
    correct: 3,
    explanation: 'Both lvextend -r (or --resizefs) and lvresize --resizefs will extend the LV and automatically resize the filesystem in one step. Without -r/--resizefs, the LV grows but the filesystem remains the old size — you must then run resize2fs (ext4) or xfs_growfs (xfs) manually. Always use -r for convenience and safety.',
  },
  {
    id: 'q4',
    question: 'What file configures filesystems to mount automatically at boot?',
    options: ['/etc/mounts', '/etc/fstab', '/etc/mount.conf', '/boot/grub/mount.cfg'],
    correct: 1,
    explanation: '/etc/fstab (filesystem table) defines which filesystems to mount at boot. Each line specifies: device (UUID or path), mount point, filesystem type, mount options, dump, and fsck pass order. Always use UUIDs (not /dev/sdb1 — these can change) and test with "mount -a" before rebooting to catch errors.',
  },
  {
    id: 'q5',
    question: 'What command shows disk space usage of mounted filesystems in human-readable form?',
    options: ['du -sh /*', 'lsblk -f', 'df -h', 'fdisk -l'],
    correct: 2,
    explanation: 'df -h (disk free, human-readable) shows filesystem-level space usage — total, used, available, and percentage for each mounted filesystem. du (disk usage) measures directory/file sizes. lsblk shows block device tree. fdisk -l shows partition table information. For day-to-day disk space monitoring, df -h is your go-to command.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success', danger: 'callout-danger' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title} — </strong>}{children}</div>
    </div>
  )
}

function LabStep({ number, description, command, language = 'bash', output }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30
                         text-accent-amber text-[11px] font-bold font-mono flex items-center
                         justify-center flex-shrink-0 mt-0.5">{number}</span>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      {command && <div className="ml-9"><CodeBlock code={command} language={language} showCopy /></div>}
      {output && (
        <div className="ml-9 rounded-xl bg-surface-950 border border-surface-700 px-4 py-3
                        font-mono text-xs text-accent-green leading-6">
          {output.split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}

export default function LinuxDisk() {
  return (
    <LessonLayout
      lessonId="linux-09"
      courseId="linux"
      title="Disk Management & LVM"
      courseTitle="Linux Fundamentals"
      courseHref="/linux"
      xp={80}
      readTime="~35 min"
      icon="💾"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Linux Fundamentals', href: '/linux' },
        { label: 'Disk Management & LVM' },
      ]}
      prev={{ title: 'Firewall with iptables & ufw', href: '/linux/firewall' }}
      next={{ title: 'Linux Server Hardening',       href: '/linux/hardening' }}
      objectives={[
        'Inspect block devices and partition tables with lsblk and fdisk',
        'Create partitions and format filesystems',
        'Mount filesystems temporarily and persistently via /etc/fstab',
        'Understand the three LVM layers: PV, VG, LV',
        'Create LVM volumes and extend them live without downtime',
        'Manage swap space and understand Linux memory management',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          Every sysadmin will eventually face a "disk full" crisis at 2am. Understanding
          Linux disk management — from raw partitions through to LVM — means you can
          expand storage, add disks, and resize volumes without downtime, without panic,
          and without data loss.
        </p>
        <p className="mt-4">
          This lesson covers the complete disk management stack: reading the block device
          tree, creating partitions, formatting filesystems, persistent mounts via fstab,
          and LVM — the flexible volume management system used in virtually every production
          Linux environment.
        </p>
        <Callout type="danger" icon="🚨" title="Practice in a VM first">
          Disk operations are among the few that can cause instant, irrecoverable data loss.
          <em> Always</em> practice in the VMware lab before touching production. Take a
          snapshot before starting any disk work.
        </Callout>
      </section>

      {/* ── DISK INSPECTION ── */}
      <section>
        <h2>Inspecting Block Devices</h2>
        <CodeBlock title="Disk inspection commands" language="bash" code={CODE_LINUXDISK_1} />

        <div className="info-card mt-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Reading lsblk output
          </p>
          <div className="font-mono text-xs text-slate-400 leading-7">
            <div className="flex gap-6">
              <pre className="text-accent-green">{`NAME        MAJ:MIN  SIZE  TYPE  MOUNTPOINT
sda           8:0     40G   disk
├─sda1        8:1      1G   part  /boot
├─sda2        8:2      2G   part  [SWAP]
└─sda3        8:3     37G   part
  ├─vg0-root  253:0   20G   lvm   /
  └─vg0-data  253:1   17G   lvm   /data
sdb           8:16    20G   disk             ← Unpartitioned new disk`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTITION + FORMAT + MOUNT ── */}
      <section>
        <h2>Partitioning, Formatting & Mounting</h2>
        <CodeBlock title="Full workflow: new disk → mounted filesystem" language="bash" code={CODE_LINUXDISK_2} />
      </section>

      {/* ── LVM ── */}
      <section>
        <h2>LVM — Logical Volume Manager</h2>
        <p>
          LVM adds a flexible abstraction layer above partitions. Instead of fixed-size
          partitions, LVM lets you pool multiple disks, resize volumes live, take
          point-in-time snapshots, and migrate data between disks — all without unmounting.
        </p>

        <div className="info-card mt-5 overflow-hidden">
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-surface-700">
            {[
              { layer: 'Physical Volume (PV)', icon: '💽', color: 'text-accent-amber', cmd: 'pvcreate, pvdisplay, pvs', desc: 'A block device (disk or partition) initialised for LVM. The raw storage provider. Run pvcreate /dev/sdb to initialise.' },
              { layer: 'Volume Group (VG)',    icon: '📦', color: 'text-accent-cyan',  cmd: 'vgcreate, vgdisplay, vgs', desc: 'One or more PVs pooled together into a single storage resource. LV sizes come from the VG pool. Extendable by adding PVs.' },
              { layer: 'Logical Volume (LV)',  icon: '🗂️', color: 'text-accent-green', cmd: 'lvcreate, lvdisplay, lvs', desc: 'Carved from a VG and used like a regular partition — format with mkfs, mount it. Resizable without unmounting (ext4/xfs).' },
            ].map(l => (
              <div key={l.layer} className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{l.icon}</span>
                  <p className={`font-bold text-sm ${l.color}`}>{l.layer}</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{l.desc}</p>
                <code className="text-[11px] font-mono text-slate-500">{l.cmd}</code>
              </div>
            ))}
          </div>
        </div>

        <CodeBlock className="mt-5" title="LVM setup — full workflow" language="bash" code={CODE_LINUXDISK_3} />

        <h3>Extending a Logical Volume Live</h3>
        <Callout type="info" icon="⚡" title="No downtime required">
          This is one of LVM's superpowers — resize a volume and its filesystem while
          it's mounted and in use. Databases, web servers, all running — no interruption.
        </Callout>
        <CodeBlock language="bash" code={CODE_LINUXDISK_4} />
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Lab Setup">
          Before starting: in VMware Workstation, add two 10GB virtual disks to the Ubuntu
          Server VM. They'll appear as /dev/sdb and /dev/sdc. Take a snapshot first.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB LINUX-9</span>
            <span className="text-sm font-semibold text-white">Create an LVM Volume Group and Extend It Live</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~25 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Verify the new disks are visible and check the current disk layout."
              command={CODE_LINUXDISK_5}
              output={CODE_LINUXDISK_6}
            />
            <LabStep number={2}
              description="Install LVM tools, then initialise both disks as Physical Volumes."
              command={CODE_LINUXDISK_7}
              output={CODE_LINUXDISK_8}
            />
            <LabStep number={3}
              description="Create a Volume Group pooling both disks, then carve out two Logical Volumes."
              command={CODE_LINUXDISK_9}
              output={CODE_LINUXDISK_10}
            />
            <LabStep number={4}
              description="Format, mount, and add to fstab for persistence."
              command={CODE_LINUXDISK_11}
              output={CODE_LINUXDISK_12}
            />
            <LabStep number={5}
              description="Extend lvdata by 3GB while it's mounted — no downtime required."
              command={CODE_LINUXDISK_13}
              output={CODE_LINUXDISK_14}
            />
            <Callout type="success" icon="✅" title="Lab Complete">
              Two disks are pooled into an LVM volume group, two logical volumes are formatted
              and mounted persistently, and you've extended a live filesystem without unmounting.
              This is exactly what you'd do in production when a disk fills up.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── QUICK REF ── */}
      <section>
        <h2>Quick Reference</h2>
        <CodeBlock title="Disk & LVM command cheat sheet" language="bash" code={CODE_LINUXDISK_15} />
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="linux-09" title="Disk Management & LVM Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
