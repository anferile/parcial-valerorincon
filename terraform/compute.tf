locals {
  user_data_rendered = templatefile("${path.module}/user_data.sh", {
    instance_index = "INDEX_PLACEHOLDER"
    app_port       = var.app_port
    repo_url       = var.app_repo_url
    repo_branch    = var.app_repo_branch
    app_subdir     = var.app_subdir
    db_host        = aws_db_instance.main.address
    db_port        = aws_db_instance.main.port
    db_name        = var.db_name
    db_user        = var.db_username
    db_password    = var.db_password
  })
}

resource "aws_instance" "app" {
  count                       = var.ec2_count
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.ec2_instance_type
  key_name                    = var.key_pair_name
  subnet_id                   = aws_subnet.public[count.index % length(aws_subnet.public)].id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  iam_instance_profile        = var.instance_profile_name
  associate_public_ip_address = true
  monitoring                  = true

  user_data = replace(local.user_data_rendered, "INDEX_PLACEHOLDER", tostring(count.index + 1))

  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = merge(local.common_tags, {
    Name      = "${local.name_prefix}-ec2-${count.index + 1}"
    Role      = "app-server"
    NodeIndex = count.index + 1
    Instance  = "instance-${count.index + 1}"
  })

  depends_on = [aws_db_instance.main]
}

resource "aws_cloudwatch_metric_alarm" "ec2_cpu_high" {
  count               = var.ec2_count
  alarm_name          = "${local.name_prefix}-ec2-${count.index + 1}-cpu-high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 60
  statistic           = "Average"
  threshold           = 75
  alarm_description   = "Alarma cuando la CPU de la EC2 ${count.index + 1} supera el 75%"
  dimensions = {
    InstanceId = aws_instance.app[count.index].id
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "alb_unhealthy" {
  alarm_name          = "${local.name_prefix}-alb-unhealthy-hosts"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Maximum"
  threshold           = 1
  alarm_description   = "Alarma cuando alguna EC2 del target group reporta unhealthy"

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
    TargetGroup  = aws_lb_target_group.app.arn_suffix
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name          = "${local.name_prefix}-alb-5xx-spike"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Spike de respuestas 5xx desde las EC2"
  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }

  tags = local.common_tags
}
