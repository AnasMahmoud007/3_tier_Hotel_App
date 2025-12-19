Terraform EKS Infrastructure - AutoOpsThis Terraform project provisions a complete AWS infrastructure for deploying an Amazon Elastic Kubernetes Service (EKS) cluster. It covers networking, compute, IAM, and persistent storage required for running containerized workloads in a production-like environment.OverviewThis infrastructure creates the following AWS resources:Virtual Private Cloud (VPC) with public and private subnets across multiple Availability Zones.Amazon EKS cluster with managed worker node groups.IAM roles and policies for EKS control plane and worker nodes.Encrypted Amazon EBS volume for persistent MySQL storage.Internet Gateway, NAT Gateway, and routing components.The design follows AWS and Kubernetes best practices for security, scalability, and maintainability.PrerequisitesBefore deploying this infrastructure, ensure the following tools and permissions are available:AWS account with sufficient permissions (AdministratorAccess recommended).AWS CLI installed and configured.Terraform version 1.0 or higher.kubectl installed (optional, for validation).Verify AWS credentials:aws sts get-caller-identity

Quick StartInitialize Terraformterraform init

Downloads required providers and Terraform modules.Review Deployment Planterraform plan

Review all resources before creation.Apply Configurationterraform apply

Type yes when prompted. Deployment typically takes 10-15 minutes due to EKS provisioning.Configure kubectlaws eks update-kubeconfig --name AutoOps-cluster --region eu-north-1

Verify Clusterkubectl get nodes

Nodes should appear in Ready state.Terraform Configuration Filesmain.tfDefines Terraform version requirements.Configures AWS provider (version 5.x).Uses region defined in variables.tf.variables.tfaws_region:Description: AWS region for all resources.Type: string.Default: eu-north-1.Override via CLI: terraform apply -var="aws_region=us-east-1".vpc.tfCreates the networking layer for the cluster.VPC: Name AutoOps-vpc, CIDR 10.0.0.0/16.Availability Zones: Two AZs for high availability (e.g., eu-north-1a, eu-north-1b).Public Subnets: 10.0.1.0/24, 10.0.2.0/24 (Used for Load Balancers and NAT Gateway).Private Subnets: 10.0.3.0/24, 10.0.4.0/24 (Used for EKS worker nodes and databases).NAT Gateway: Single NAT Gateway (cost-optimized) for outbound internet access from private subnets.DNS: DNS hostnames and support enabled.eks.tfCreates the Amazon EKS cluster and managed node groups.Cluster: Name AutoOps-cluster, Kubernetes version 1.29, Public API endpoint enabled.Networking: Deployed inside the VPC; worker nodes run in private subnets.Node Groups:Instance type: t3.micro.Scaling: Min 1, Max 3, Desired 1.Disk size: 20 GB.IAM: Uses pre-created roles defined in iam.tf.iam.tfDefines IAM roles and permissions.EKS Cluster Role: Trusted by eks.amazonaws.com. Policies: AmazonEKSClusterPolicy, AmazonEKSVPCResourceController.EKS Node Role: Trusted by ec2.amazonaws.com. Policies: AmazonEKSWorkerNodePolicy, AmazonEKS_CNI_Policy, AmazonEC2ContainerRegistryReadOnly, CloudWatchAgentServerPolicy.ebs.tfCreates encrypted persistent storage for MySQL.EBS Volume: Size 50 GB, Type gp3, Encrypted.Purpose: Used for MySQL StatefulSet; referenced in Kubernetes PersistentVolume.Note: MySQL pods must run in the same AZ as the EBS volume.outputs.tfExposes useful infrastructure outputs:Cluster: cluster_name, cluster_endpoint, cluster_security_group_id.Network: vpc_id, private_subnets, public_subnets.IAM: node_group_role_name, node_group_role_arn.Storage: ebs_volume_id, ebs_volume_az.Utility: configure_kubectl (ready-to-use command).Cost Estimation (Approximate)| Component | Cost || EKS Control Plane | ~$72/month || EC2 Worker Node (t3.micro) | ~$15-20/month || NAT Gateway | ~$32/month || EBS gp3 (50GB) | ~$5/month || Estimated Total | ~$120-140/month |Destroying InfrastructureTo delete all resources:terraform destroy

This permanently deletes the EKS cluster, worker nodes, EBS volumes, VPC, and IAM roles. Ensure backups are taken before destruction.File Structureterraform-eks/
├── main.tf
├── variables.tf
├── vpc.tf
├── eks.tf
├── iam.tf
├── ebs.tf
├── outputs.tf
└── README.md

Project InformationProject Name: AutoOpsType: Terraform - AWS - EKS InfrastructureMaintained By: Infrastructure / DevOps TeamLast Updated: December 2025
